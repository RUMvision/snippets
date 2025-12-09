window.navigationType = null;
function conservativeGTM(gtmId, e) {
    if (window.navigationType) {
        // GTM already successfully embedded before
        return;
    }

    if (document.prerendering && !e) {
        // First call during prerender: try again when visible
        document.addEventListener(
            'prerenderingchange',
            ev => conservativeGTM(gtmId, ev), // re-submit config, still get the event
            {once: true}
        );
        return;
    }

    const curNav = performance.getEntriesByType('navigation')[0];
    window.navigationType = e?.type || curNav?.type || 'navigate';

    // your typical GTM code, using `config` if needed
    (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src =
            'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);
}

// Initial call + pass your GTM ID
conservativeGTM('GTM-CODE');