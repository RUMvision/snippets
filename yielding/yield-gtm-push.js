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
	options.counter = 1 + Object.keys(window.yieldCounter).length;
	markName = options.counter + '-' + options.label;
    yieldCounter[markName] = options;  
    performance.mark(markName + '-start');
	console.trace("Trace for GTM push", options.label, options.event );
  }

  const setMarkMeasure = () => {
    if (!markName) {
	    return;
	}
	
	// special treatment/prefixing for parameters for GTM push event
	const item = yieldCounter[markName];
	const evt = item.event?.[0] || {};
	const props = Object.entries( evt ).map(([key, value]) => [
	  `param ${key}`,
	  typeof value === "string" ? value: value.toString()
	]);
	
    performance.mark(markName + '-end');
    performance.measure( evt?.event || evt?.[0] || item.mark, {
	  start: markName + '-start',
	  end: markName + '-end',
	  detail: {
	    devtools: {
	      dataType: "track-entry",
	      track: "GTM push",
	      trackGroup: "Yielding",
	      color: "secondary-light",
		  tooltipText: item.counter + ": " + item.label + " (prio: " + item.priority + ")",
		  properties: props
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
function getGtmEventName(e) {
  /*
	For example:
		[['get', 'G-ABCDE12FGH', 'session_id']]
	Or:
		[{event: 'gtm.load'}]
  */
  return ( e[0]?.event || Object.values(e?.[0]).filter(v => typeof v === "string").join('-') || '' );
}
function isPriorityEvent(eventName) {
  if ( !gtmPriorityEventMatches.length) {
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
    const name = getGtmEventName(e); // Event name

    yieldToMain({
      mark: 'dataLayer',
	  label: name,
      priority: isPriorityEvent(name) ? 'user-blocking' : 'background',
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
        throw new Error('Attempted overwrite of dataLayer.push');
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