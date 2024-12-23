/*
remove all elements matching a specific selector
*/

// remove all iframes and images
document.querySelectorAll("iframes,img").forEach(e => e.parentNode.removeChild(e));

// remove all inline styles and stylesheets
document.querySelectorAll("style, link[rel=stylesheet]").forEach(e => e.parentNode.removeChild(e));

// remove all noscript elements, which can be convenient to see how the page looks like without noscript fallbacks
// this only makes sense when [1] disabling JS [2] load the page [3] enable JS again [4] execute this code
document.querySelectorAll("noscript").forEach(e => e.parentNode.removeChild(e));