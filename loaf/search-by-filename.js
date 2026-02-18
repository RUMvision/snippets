/*
easily search through all LoAF's 
convenient if you think that hotjar is causing
it will then log the entry duration, individual script duration and whole loaf entry (+responsible script)
*/

function reportLoAFByString(filename, minDuration) {
    let loafs = [];
    minDuration = parseInt(minDuration || 0);
    new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
            let script = null;
            for (let i = 0; i < entry.scripts.length; i++) {
                if (entry.scripts[i]?.sourceURL?.indexOf(filename) > 1 && entry.scripts[i].duration >= minDuration) {
                    script = entry.scripts[i];
                }
            }

            if (script) {
                console.log('LoAF:', entry.duration, script.duration, {
                    entry: entry,
                    script: script
                });
                loafs.push(entry);
            }
        }

        const prefix = loafs.length ? loafs.length : 'so far, no';
        console.log(prefix + ' LoAFs found matching %c' + filename + '%c and a minimum of %c' + minDuration + 'ms',
            'background-color: #00c; color: #fff; border-radius: 6px; padding: 2px 4px',
            'background-color: #fff; color: #000;',
            'background-color: #00c; color: #fff; border-radius: 6px; padding: 2px 4px'
        );
    }).observe({
        type: 'long-animation-frame',
        buffered: true
    });
}

const filename = prompt("For which domain or file do you want to see the LoAFs?", "hotjar");
if (filename != null) {
    const minDuration = prompt("Only show tasks as of how much ms?", "5");
    reportLoAFByString(filename, minDuration);
}