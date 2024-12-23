/*
Saving all LoAFs to an array 
You can then log them in your console by doing `console.log( loafs );` at any given moment
*/
let loafs = [];
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    loafs.push( entry );
  }
}).observe({type: 'long-animation-frame', buffered: true});
