// More info:
// https://www.rumvision.com/blog/prerender-until-script-in-between-prefetch-and-prerender/
function isChromium(min = 144, max = 158) {
	const version = Number(
		navigator.userAgentData?.brands
		?.find(({ brand }) => brand.toLowerCase() === 'chromium')
		?.version
	);

	return version >= min && version <= max;
}

function enableChromeOriginTrial(token, minVersion = 144, maxVersion = 158) {
    // Skip if token is missing
    if (!token) {
        return false;
    }

    // Detect Chromium
	const version = Number(
		navigator.userAgentData?.brands
		?.find(({ brand }) => brand.toLowerCase() === 'chromium')
		?.version
	);
	
    // Skip if outside allowed Chromium version range
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
const sampling = 75;

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
	enableChromeOriginTrial(originTrialToken) && Math.random() < (sampling/100) ? 'prerender_until_script' : 'prefetch',
	'conservative'
);