/*
Log all CLS events to your console 
When a CLS is happening after 500ms since last user input, `hadRecentInput` will be `false`
Such CLS is considered unexpected and taken into account for Core Web Vitals.

When it's an unexpected CLS, a warning will be shown, showing the total sum up to that moment.
But if the 0.1 threshold is exceeded, an error will be shown, showing the total sum up to that moment. 

Do note that in reality, the sum is reset to 0 after 5 seconds while the highest up to that moment will be the value which will be reported to Google (and RUM solutions).

More nuances and an explanation on how CLS is being measured per 5 second window sessions:
https://www.erwinhofman.com/blog/google-announces-cls-metric-will-change-how/#meet-the-new
*/
let cls = 0;
new PerformanceObserver(l => {
	l.getEntries().forEach(e => {
		console.log(e);
		if (!e.hadRecentInput) {
            cls += e.value;
            if ( cls > 0.1 ) {
                console.error('New total CLS value:', cls);
            }
            else {
                console.warn('New total CLS value:', cls);
            }
		}
	})
}).observe({type: 'layout-shift', buffered:true});