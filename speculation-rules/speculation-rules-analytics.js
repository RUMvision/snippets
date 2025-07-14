/*
This code shows how to handle pagehits that were prerendered.
This could be important as pages could be prerendered while never being visited by users.
This could become an issue in your analytics data when such a prerendered but not-visited page was tracked anyway.
This will happen as the page and its resources will be rendered and executed as usual, but when tracking scripts aren't taking the prerendered-state of the page into account.

A best practive is to hook into the prerenderingchange event and only perform certain actions once the page actually becomes visible.
RUMvision is already taking this into account as RUMvision is built on top of the official web-vitals library.

The code below can be found in the web.dev docs:
https://developer.chrome.com/docs/web-platform/prerender-pages#impact-on-analytics
*/

// Set up a promise for when the page is activated,
// which is needed for prerendered pages.
const whenActivated = new Promise((resolve) => {
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', resolve, {once: true});
  } else {
    resolve();
  }
});

async function initAnalytics() {
  await whenActivated;
  console.log('Initialise your analytics');
}

initAnalytics();