/*
This code snippet can be used in Chrome DevTools to learn or test with the yielding strategy and see the effect in the DevTools Performance panel

When the page you're applying this code is using jQuery or similar libraries/frameworks which are configured to listen to click events, you might also see other work in the flamecharts within the Performance panel

The endgoal is to see broken up tasks in between each `yieldToMain` call.
Browsers might then decide to do Layout work in between those tasks, which should improve INP as the processing duration of an INP is reduced with this strategy.

*/

var yieldCounter = {};
function yieldToMain(callback,mark='void')
{	
  let markName;
  
  if ( window.yieldCounter ) {
	// if window.yieldCounter exists, start counting + mark the start of yielding
    yieldCounter[ mark ] = yieldCounter[ mark ] || 0;    
	markName = [ 'yieldToMain', mark, ++yieldCounter[ mark ] ].join('-');
    performance.mark(markName + '-start');
  }  
  
  const promise = 'scheduler' in window && 'yield' in scheduler
      ? scheduler.yield()
      : new Promise(resolve => setTimeout(resolve, 0));

  if (callback) {
    promise.then(() => {
      if ( markName ) {
		// Mark the end of yielding + measure yield duration
        performance.mark(markName + '-end');  
        performance.measure(markName, markName + '-start', markName + '-end');
	  }
      callback();
    });
  }

  return promise;
}

var lastColor = '';
async function doWork(callback) {
  // Initial DOM modification that triggers layout
  updateDiv('green');
  // Yield to the main thread to allow rendering
  await yieldToMain();
  updateDiv('red');

  // Change DOM again after yielding, which should trigger another layout/paint
  updateDiv('blue');

  // Yield to the main thread to allow rendering
  await yieldToMain(callback);
  updateDiv('yellow');
}

var counterVar = 0;
// individual function names for better recognition and representation in Performance panel
function counter(){counterVar++;}
function greenLoops(){return doLoops();}
function redLoops(){return doLoops();}
function blueLoops(){return doLoops();}
function yellowLoops(){return doLoops();}
function doLoops() {
  for (let i = 0; i < 2e6; i++) {
    counter();
  } 
}

function updateDiv(bgColor) {
    if ( lastColor.length ) {
        performance.mark(lastColor + 'style-end');
        performance.measure(lastColor+'style', lastColor + 'style-start', lastColor + 'style-end');
    }
    
    lastColor = bgColor + '-';
    performance.mark(lastColor + 'loop-start');
	// dynamically call color-based loops function
    window[bgColor + 'Loops']();
    
    performance.mark(lastColor + 'loop-end');
    performance.measure(lastColor+'loop', lastColor + 'loop-start', lastColor + 'loop-end');
    
    performance.mark(lastColor + 'style-start');
    document.querySelector('#yield-div').style.backgroundColor = bgColor;
}

// Dynamically add a div with id="yield-div" and content "lorem ipsum" to the start of the body
function initYieldDiv() {
  const yieldDiv = '<div id="yield-div">click me</div>';
  document.body.insertAdjacentHTML('afterbegin', yieldDiv); // Adds the div at the start of the body

  // Add the event listener to the newly created div
  document.querySelector('#yield-div').addEventListener("click", function() {
    performance.mark('yield-div-start');
    doWork(() => {
        performance.mark('yield-div-end');
        performance.measure('yield-div', 'yield-div-start', 'yield-div-end');
        performance.measure(lastColor+'style', lastColor + 'style-start', lastColor + 'style-end');
        performance.mark('text-foo-bar');
        document.querySelector('#yield-div').innerHTML = 'foo bar foo bar foo bar foo bar foo bar foo bar';
    });
  });
}

if (document.readyState === 'complete') {
  // If the DOMContentLoaded has already fired, execute immediately
  initYieldDiv();
} else {
  // If the document is still loading, wait for DOMContentLoaded
  window.addEventListener('DOMContentLoaded', initYieldDiv);
}
