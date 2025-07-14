/*
The code below will inject Speculation Rules, applying prerendering to all pages

From the web.dev docs:
https://developer.chrome.com/docs/web-platform/prerender-pages

Debugging Speculation Rules:
https://developer.chrome.com/docs/devtools/application/debugging-speculation-rules#debug-prerender-other-panels
*/

(function() {
  if ( !HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules') ) {
    console.warn('speculation rules not supported');
    return;
  }

  const specScript = document.createElement('script');
  specScript.type = 'speculationrules';
  specRules = {
    prerender: [
      {
        where: { "href_matches": "/*" },
        eagerness: 'moderate'
      },
    ],
  };
  specScript.textContent = JSON.stringify(specRules);
  console.log('speculation rules added');
  document.body.append(specScript);
}());