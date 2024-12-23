/*
just like Perfetto, show LoAFs in your DevTools performance panel timeline
this will also conveniently show the longest running script within each LoAF
*/

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('entry', entry);
    performance.measure('LoAF', {
      start: entry.startTime,
      end: entry.startTime + entry.duration,
    });
    performance.measure('LoAF render duration', {
      start: entry.renderStart,
      end: entry.styleAndLayoutStart ,
    });
    performance.measure('LoAF work duration', {
      start: entry.startTime,
      end: entry.renderStart ? entry.renderStart: entry.duration,
    });

    // START main offender/script info
    let highest = {duration:0};   
    for ( let i = 0; i < entry.scripts.length; i++ ) {
        if ( entry.scripts[i].duration > highest.duration  ) {
            highest = entry.scripts[i];
        }
    }

    if ( highest.sourceURL ) {
            const details = { location: highest.sourceURL, name: highest.name, type: highest.type };
            console.log( details );
            console.log( 'highest', highest );
            performance.measure( Object.values( details ).join('-'), {
              start: 1+highest.startTime,
              end: highest.startTime + highest.duration,
            });

			if ( entry.firstUIEventTimestamp ) {
				performance.measure( 'delay', {
				  start: entry.firstUIEventTimestamp,
				  end: highest.startTime
				});
			}
            performance.measure( 'compile', {
              start: 1+highest.startTime,
              end: highest.executionStart
            });
            performance.measure( 'execute', {
              start: highest.executionStart,
              end: highest.startTime + highest.duration,
            });
    }
  }
});
observer.observe({ type: 'long-animation-frame', buffered: true });