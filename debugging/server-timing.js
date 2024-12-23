/*
if a site's response headers is exposing server timing information, then it can be logged to the console
an example can be found on erwinhofman.com, so try this code over there
or see this linkedin post: https://www.linkedin.com/posts/erwinhofman_performance-lighthouse-pagespeed-activity-7090265773780209664-tNAO
want to collect such server information in bulk? Use RUMvision.com, which supports collecting this data out of the box
*/

const nav = window.performance.getEntriesByType('navigation')[0];
console.table(nav.serverTiming);
