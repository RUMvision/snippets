let navigationType = null;
function conservativeGTM(e) {
	if (navigationType) {
		// already successfully called before
		return;
	}
	if (document.prerendering) {
		// let's try again when it comes visible
		document.addEventListener('prerenderingchange', conservativeGTM, { once: true });
		return;
	}

	navigationType = e?.type || performance.getEntriesByType('navigation')[0]?.type || 'navigate';

	(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
	new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
	j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
	'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
	})(window,document,'script','dataLayer','GTM-CODE');
}
conservativeGTM();