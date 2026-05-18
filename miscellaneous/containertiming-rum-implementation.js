/**
This script contains the stand alone equivalent of the implementation in RUMvision

You'll need an origin trial token until at least Chrome 153:
https://developer.chrome.com/blog/container-timing-origin-trial#how_to_enable_container_timing
https://developer.chrome.com/origintrials/#/view_trial/3312960475884421121

HTML:
<div
	containertiming="hero"
	data-container-timing-until='{"entries":1,"interactions":1}'
>
	...
</div>

**/

(function containerTimingLogger() {

    const containers = document.querySelectorAll('[containertiming]');

    // Fail early when Container Timing cannot be tested in this browser/page.
    const warn = !containers.length ? 'No containers found' :
        (!('PerformanceObserver' in window) ? 'PerformanceObserver not supported' :
            (typeof PerformanceContainerTiming === "undefined" ? 'ContainerTiming not supported' : ''));

    if (warn.length) {
        console.warn('[ContainerTiming]', warn);
        return;
    }

    const state = {
        // Accepted entries per containertiming identifier.
        entries: {},

        // Containers that reached their stop condition.
        done: {},

        // Used to disconnect the observer once all containers are done.
        count: containers.length,

        // Tracks user input so collection can stop after interaction.
        interactions: {
            perType: {},
            increment(type) {
                this.perType[type] = (this.perType[type] || 0) + 1;
            },
            getCount(type) {
                if (type) {
                    return this.perType[type] || 0;
                }

                return Object.values(this.perType)
                    .reduce((total, count) => total + count, 0);
            }
        }
    };

    function getConfig(entry) {
        // Default stop behavior when no data-container-timing-until is present.
        const fallback = {
            entries: 2,
            interactions: 1,
			subtract: false,
			value: false,
        };

        const attr = entry.rootElement?.getAttribute('data-container-timing-until');

        if (!attr) {
            return fallback;
        }

        try {
            // Merge page-specific config with defaults.
            return Object.assign(fallback, JSON.parse(attr));
        } catch (e) {
            console.warn('[ContainerTiming] Invalid data-container-timing-until JSON:', attr);
            return fallback;
        }
    }

    function getId(entry) {
        // Normalize the identifier so it can safely be used as an object key or metric name.
        return (entry.identifier || entry.name || 'container')
            .replace(/[\W]+/g, '-');
    }

    function shouldStop(config, id) {
        // Stop after total interactions, for example: {"interactions":1}
        if (config.interactions && state.interactions.getCount() >= config.interactions) {
            return true;
        }

        // Stop after accepted entries, for example: {"entries":2}
        if (config.entries && (state.entries[id] || 0) >= config.entries) {
            return true;
        }

        // Stop after specific interaction types, for example: {"click":2}
        for (const [type, limit] of Object.entries(config)) {
            if (
                typeof limit === 'number' &&
                state.interactions.getCount(type) >= limit
            ) {
                return true;
            }
        }

        return false;
    }

    function markDone(id, observer) {
        state.done[id] = true;

        // Once all configured containers are done, stop processing entries.
        if (Object.keys(state.done).length >= state.count) {
            console.info('[ContainerTiming] All containers done. Disconnecting observer.');
            observer.disconnect();
        }
    }
	
	function getFinalValue(entry, field, subtract) {
		const fallback = entry.presentationTime ?? entry.startTime;
		const value = field ? entry[field] : fallback;

		return Math.min(0, ( Number.isFinite(value) ? value: fallback ) - ( Number( subtract ) || 0 ) );
	}

    function logEntry(entry, config, id) {
		// metrics could contain your collected metrics, like TTFB and FCP
		const metrics = {};
        // Prefer presentationTime when available. Fall back to startTime.
		const finalValue = getFinalValue(entry, config.value, metrics?.[config.subtract] );

        // Replace this with your own RUM endpoint.
        console.log('[ContainerTiming]', {
            id,
            finalValue,
            presentationTime: entry.presentationTime,
            startTime: entry.startTime,
            duration: entry.duration,
            identifier: entry.identifier,
            name: entry.name,
            entry,
            config
        });
		
		
    }

    if (document.querySelector('[data-container-timing-until]')) {
        // Capture early interaction signals that may define a stop condition.
        ['keydown', 'mousedown', 'touchstart', 'click', 'scrollend'].forEach(type => {
            window.addEventListener(type, event => {
                state.interactions.increment(event.type);
            }, {
                capture: true,
                passive: true
            });
        });
    }

    const observer = new PerformanceObserver((list, observer) => {
        list.getEntries().forEach(entry => {
            const id = getId(entry);
            const config = getConfig(entry);

            if (state.done[id]) {
                return;
            }

            // Skip and finish this container when it already passed its stop condition.
            if (shouldStop(config, id)) {
                markDone(id, observer);
                return;
            }

            logEntry(entry, config, id);

            // Count only entries that were accepted and logged.
            state.entries[id] = (state.entries[id] || 0) + 1;

            // Mark this container done after the accepted entry limit is reached.
            if (config.entries && state.entries[id] >= config.entries) {
                markDone(id, observer);
            }
        });
    });

    try {
        observer.observe({
            type: 'container',
            buffered: true
        });

        console.info('[ContainerTiming] Observer started.');
    } catch (e) {
        console.warn('[ContainerTiming] Container Timing observer failed:', e);
    }
})();