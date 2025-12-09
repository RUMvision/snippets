function runWhenIdle(callback) {
    if ('requestIdleCallback' in window) {
        requestIdleCallback(callback);
    } else {
        callback();
    }
}

(function hookDataLayerPush() {
    // Keep the original Array.prototype.push
    const originalArrayPush = Array.prototype.push;

    // Track all arrays that are (or were) used as dataLayer
    const trackedDataLayers = new WeakSet();

    // Initialize from any existing dataLayer
    let _dataLayer = window.dataLayer || [];
    trackedDataLayers.add(_dataLayer);

    // Intercept window.dataLayer so future replacements are tracked as well
    Object.defineProperty(window, "dataLayer", {
        configurable: true,
        enumerable: true,
        get() {
            return _dataLayer;
        },
        set(value) {
            _dataLayer = value;
            if (value && typeof value.push === "function") {
                trackedDataLayers.add(value);
            }
        }
    });

    // Patch Array.prototype.push once
    Array.prototype.push = function(...items) {
        if (trackedDataLayers.has(this)) {
            const e = [].slice.call(arguments, 0); // Convert arguments to an array
            const type = e[0]?.event || Object.values(e?.[0]).filter(v => typeof v === "string").join('-') || 'unknown';

            performance.mark('start.dataLayer.push.' + type);
			
            // only defer when events match the following:
            if (type.startsWith('CookieScript') || type.startsWith('consent')) {
                console.log("dataLayer.push called with:", ...items);

                const self = this;
                const expectedLength = self.length + items.length;

                // Defer the actual push
                runWhenIdle(function() {
                    originalArrayPush.apply(self, items);
                    performance.measure('dataLayer.idle.push.' + type, 'start.dataLayer.push.' + type);
                });

                // Mimic the usual return value of push()
                return expectedLength;
            }
            performance.measure('dataLayer.push.' + type, 'start.dataLayer.push.' + type);

        }
        return originalArrayPush.apply(this, items);
    };
})();