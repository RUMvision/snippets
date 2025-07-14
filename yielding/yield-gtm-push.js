/*
This code can be used to hijack GTM's `dataLayer.push` and defer the `push` by yielding in between.

As a result, the `push` events won't be part of the interaction's `processing duration` and INP should improve.
Do note that with this strategy, some events might never be sent to GTM, so double-check your event count before and after implementing this.

If you do see loss of events, you could add events to `const gtmPriorityEventMatches` array to handle with priority.
Do note that those events will then still continue to impact INP.
*/

// A set to track all unresolved yield promises
// based on https://kurtextrem.de/posts/improve-inp#exit-event-handlers-yieldunlessurgent
const pendingResolvers = new Set();
// Resolves all unresolved yield promises when visibility changes
function resolvePendingPromises() {
  document.removeEventListener('visibilitychange', resolvePendingPromises);
  for (const resolve of pendingResolvers) resolve();
  pendingResolvers.clear();
}

// uncomment next line to log yielding to a custom track:
//window.yieldCounter = {};
function yieldToMain(options = {}) {
  let markName;
  options.mark = options.mark || 'void';

  if (window.yieldCounter) {
    // Start counting + mark the start of yielding when yieldCounter exists
	const eventName = (options.event[0]?.[1] || options.event[0]?.event || '');
    yieldCounter[options.mark] = yieldCounter[options.mark] || 0;
    markName = ['yieldToMain', options.mark, ++yieldCounter[options.mark], eventName].join('-');
    performance.mark(markName + '-start');
  }

  const setMarkMeasure = () => {
    if (!markName) {
	    return;
	}
    performance.mark(markName + '-end');
    performance.measure(markName, {
	  start: markName + '-start',
	  end: markName + '-end',
	  detail: {
	    devtools: {
	      dataType: "track-entry",
	      track: "GTM",
	      trackGroup: "Yielding",
	      color: 'secondary-light'
	    }
	  }
    });
  };

  const promise = new Promise(resolve => {
    pendingResolvers.add(resolve);

    // If the page is visible, proceed with yielding
    if (document.visibilityState === 'visible') {
      document.addEventListener('visibilitychange', resolvePendingPromises);

      const schedulerPromise = 'scheduler' in window && 'yield' in scheduler
        ? scheduler.yield()
        : new Promise(resolve => setTimeout(resolve, 0));

      schedulerPromise.then(() => {
        pendingResolvers.delete(resolve);
        resolve();
      });
    } else {
      resolvePendingPromises(); // Resolve immediately if the document is hidden
    }
  });

  if (options.priority === 'user-blocking') {
    setMarkMeasure();  // Mark the end of the task for user-blocking
    return Promise.resolve();  // Return a resolved promise immediately
  }

  return promise.then(setMarkMeasure);
}

// Define the list of priority events using regular expressions
const gtmPriorityEventMatches = [/^add_to_cart$/];

function isPriorityEvent(e) {
  const eventName = (e[0]?.[1] || e[0]?.event || '');
  if (typeof eventName !== 'string' || !eventName.length) {
    return false;
  }

  // Check if the eventName matches any of the regular expressions in gtmPriorityEventMatches
  return gtmPriorityEventMatches.some(regex => regex.test(eventName));
}

function yieldDataLayerPush() {
  // Store the original dataLayer.push function as originalPush
  window.dataLayer.originalPush = window.dataLayer.push;

  // Define our yielding push wrapper
  const yieldingPush = function () {
    const e = [].slice.call(arguments, 0); // Convert arguments to an array

    yieldToMain({
      mark: 'dataLayer',
      priority: isPriorityEvent(e) ? 'user-blocking' : 'background',
      event: e
    }).then(() => {
      window.dataLayer.originalPush.apply(window.dataLayer, e);
    });
  };

  // Protect our hijack by locking the push property
  Object.defineProperty(window.dataLayer, 'push', {
    configurable: false,
    enumerable: true,
    get() {
      if (window.yieldCounter) {
        console.debug('[yield-gtm-push] Accessed dataLayer.push');
      }
      return yieldingPush;
    },
    set(newValue) {
      if (!window.yieldCounter) {
	    return;
      }
       try {
        throw new Error('[yield-gtm-push] Attempted overwrite of dataLayer.push');
      } catch (e) {
        console.groupCollapsed('[yield-gtm-push] Prevented overwrite of dataLayer.push');
        console.log('Attempted assignment:', newValue);
        console.log('Stack trace:\n', e.stack);
        console.groupEnd();
      }
    }
  });
}

var yieldObserver = new MutationObserver(() => {
  if (document.readyState === 'complete') {
    // document state change, check if at least dataLayer was created, showing intent for GTM
    if (!('dataLayer' in window)) {
	  // No dataLayer var created yet, let's abort
      yieldObserver.disconnect();
      return; 
    }
  }
  if (window.dataLayer && dataLayer.push !== Array.prototype.push) {
    // Ensure dataLayer.push has been replaced by GTM
    yieldObserver.disconnect();
    yieldDataLayerPush();  // Hijack dataLayer.push
  }
});

yieldObserver.observe(document.documentElement, { childList: true, subtree: true });