/*
Use the `reportAllChanges` flag to report every new CLS or INP whenever a new value is higher than the previously reported value.
Using this only makes sense for the CLS and INP metrics, as those are the only ones that continues to track during the full page life cycle.
See also: https://github.com/GoogleChrome/web-vitals#report-the-value-on-every-change
*/
(function () {
	const script = document.createElement('script');
	script.src = 'https://unpkg.com/web-vitals/dist/web-vitals.attribution.iife.js';
	script.onload = function () {
		webVitals.onCLS(console.log, {reportAllChanges: true});
		webVitals.onINP(console.log, {reportAllChanges: true});
	};
	document.head.appendChild(script);
})();