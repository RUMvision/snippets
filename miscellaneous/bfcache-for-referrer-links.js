/*
This JavaScript code snippet is designed to improve the user experience by leveraging the Back-Forward Cache (bfcache) for navigation when a user clicks a link that would effectively take them back to the previous page.
*/
(function(ref) {
	if (!ref) { return };

	// leverage bfcache for hard links that would go back one step anyway
	const refUrl = new URL(ref);
	const selector = 'a[href="' + refUrl.pathname + '"],a[href="' + refUrl.href + '"]';
	// query by relative and absolute links
	document.querySelectorAll(selector).forEach(link => {
		link.addEventListener('click', e => {
			e.preventDefault();
			history.go(-1);
		});
	});
})(document.referrer);