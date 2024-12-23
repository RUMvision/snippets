/*
This snippet will log the prerendering status and other parts to your console.

Do note that when you paste this into your source code in combination with `console.log`, you might not actually get to see anything in your DevTools JS Console.
That is because a prerender actually renders the whole page in advance, so your `console.log`s are already executed invisibly.
You can follow these steps though to still see Console and Network activity of prerendered but not-yet visited pages:
https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules#debug-prerender-other-panels
*/

function pagePrerendered() {
  return (
    document.prerendering ||
    self.performance?.getEntriesByType?.('navigation')[0]?.activationStart > 0
  );
}

const nav = performance?.getEntriesByType?.('navigation')[0];
const activationStart = nav.activationStart || 0;
console.table({
	prerendered: {
		value: pagePrerendered(),
		via: 'pagePrerendered()'
	},
	activationStart: {
		value: activationStart,
		via: 'activationStart', 
	},
	technicalTTFB: {
		value: nav.responseStart,
		via: 'responseStart', 
	},
	experiencedTTFB: {
		value: Math.max( nav.responseStart - activationStart, 0 ), 
		via: 'responseStart - activationStart',
	}
});