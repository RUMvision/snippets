/*
see https://github.com/GoogleChrome/web-vitals#from-a-cdn
tip: remove `@4` from the resource URL to always load the latest 
*/
(function () {
	const script = document.createElement('script');
	script.src = 'https://unpkg.com/web-vitals@4/dist/web-vitals.attribution.iife.js';
	script.onload = function () {
		// When loading `web-vitals` using a classic script, all the public
		// methods can be found on the `webVitals` global namespace.
		webVitals.onCLS(console.log);
		webVitals.onINP(console.log);
		webVitals.onLCP(console.log);
	};
	document.head.appendChild(script);
})();