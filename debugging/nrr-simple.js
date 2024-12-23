/*
NRR = notRestoredReasons, an API that helps debugging why page contents were not served from the back forward caching mechanism

A one-liner code to get the whole NRR object
*/

console.log( performance.getEntriesByType('navigation')[0].notRestoredReasons );