/*
as seen on https://www.rumvision.com/blog/google-web-vitals-v4-supports-loaf-inp-breakdown/
this will loop over all available functions via `Object.keys` 
to start listening to all available metrics and pass the metric on to your custom function 

Read about how to send custom data to RUMvision in our help-center:
https://www.rumvision.com/help-center/apis/js/custom-dimensions/
*/

function processMetric( metric ) {
	// do whatever with the metric
	
	// for example analyzing and enriching metric data before sending it:
	if ( metric?.name == 'LCP' && metric.attribution ) {
		// grab and then do something with LCP element:
		const lcpNode = metric.attribution.lcpEntry.element;
	}
	
	// and the sending it to an endpoint:
	// https://github.com/GoogleChrome/web-vitals#send-the-results-to-an-analytics-endpoint	
	
	// or to RUMvision:
	rumv('dimension', 'lcp-alt-attribute', lcpNode.getAttribute('alt') );
}

(function() {
  var script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals/dist/web-vitals.attribution.iife.js';
  script.onload = function() {
    Object.keys(webVitals).forEach(function(fn) {
	  fn.indexOf('on') === 0 && webVitals[fn]( processMetric );
    });
  }
  document.head.appendChild(script);
}());