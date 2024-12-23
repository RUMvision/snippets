/*
as seen on https://www.rumvision.com/blog/google-web-vitals-v4-supports-loaf-inp-breakdown/
contrary to the [official-web-vitals](/snippets/core-web-vitals/official-web-vitals.js), this will loop over all available functions via `Object.keys` 
to start listening to all available metrics and log each metric to the console
*/
(function() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals/dist/web-vitals.attribution.iife.js';
  script.onload = function() {
    Object.keys(webVitals).forEach(function(fn) {
	  fn.indexOf('on') === 0 && webVitals[fn](console.log);
    });
  }
  document.head.appendChild(script);
}());