/*
Logs each new detected LCP to the console 
So, if a h1 is the biggest while an even bigger image is still being downloaded, you will see two LCP events 
LCP stops being tracked on user interaction
more LCP:
https://www.rumvision.com/blog/largest-contentful-paint/
*/

new PerformanceObserver(l => {
	l.getEntries().forEach(e => {
		console.log(e);
	})
}).observe({type: 'largest-contentful-paint', buffered:true});