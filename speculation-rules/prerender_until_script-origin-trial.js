// More info:
// https://www.rumvision.com/blog/prerender-until-script-in-between-prefetch-and-prerender/

function enableChromeOriginTrial(token, minVersion = 144, maxVersion = 150) {
    // Skip if token is missing
    if (!token) {
        return false;
    }

    // Detect Google Chrome
    const ua = navigator.userAgent;
    const isChrome =
        navigator.vendor === 'Google Inc.' &&
        ua.includes('Chrome') &&
        !ua.includes('Edg') && // Edge
        !ua.includes('OPR') && // Opera
        !ua.includes('SamsungBrowser');

    if (!isChrome) {
        return false;
    }

    // Extract Chrome major version
    const match = ua.match(/Chrome\/(\d+)/);
    const version = match ? parseInt(match[1], 10) : null;

    // Skip if version cannot be determined
    if (!version) {
        return false;
    }

    // Skip if outside allowed Chrome version range
    if (version < minVersion || version > maxVersion) {
        return false;
    }

    // Inject origin trial token
    const meta = document.createElement('meta');
    meta.httpEquiv = 'origin-trial';
    meta.content = token;

    document.head.appendChild(meta);

    return true;

}


// Get your own token at:
// https://developer.chrome.com/origintrials/#/view_trial/881016677104353281
const originTrialToken = '';

(function (specType, eagerness) {

	// Feature detection
	if (!HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) {
		return;
	}

	// Generate speculation rules
	// Tailor this to the needs of your site/shop
	// via https://lab.rumvision.com/other/api/speculation-rules/generator/
	const rules = {
		[specType]: [{
			tag: specType + '+' + eagerness,
			eagerness,
			where: {
				and: [
					{ href_matches: '/*' },
					{ not: { selector_matches: '[data-noprefetch]' } }
				]
			}
		}]
	};

	const script = document.createElement('script');
	script.type = 'speculationrules';
	script.textContent = JSON.stringify(rules);

	document.head.appendChild(script);

})(
	enableChromeOriginTrial(originTrialToken) ? 'prerender_until_script' : 'prefetch',
	'conservative'
);