/*
NRR = notRestoredReasons, an API that helps debugging why page contents were not served from the back forward caching mechanism

Below is an extended way to detect bf NRR reasons and elements that prevented the browser from serving a page from bfcache

Possible output could be as following:
```
notRestoredReasons elements iframe#intercom-frame
notRestoredReasons reasons iframe:websocket
```
*/
function getKeysWithClause(obj, clauseFn, keysToReturn) {
	const result = [];
	keysToReturn = keysToReturn || {
		'id': '#%s',
		'src': '[src=%s]',
		'name': '[name=%s]',
		'reasons': ',',
	};
	function extractKeys(obj, level) {
		if (clauseFn(obj)) {
			const selectedKeys = {};
			for (const key in keysToReturn) {
				let value = obj[key];
				if (value && value.length) {
					value	= Array.isArray(value) ? value.map(function(item) {
						return item.reason || item;
					}): value;
					selectedKeys[key] = Array.isArray(value) ? value.join(keysToReturn[key]): keysToReturn[key].replace('%s', value);
				}
			}
			
			const values = Object.values(selectedKeys);
			if (values.length > 0) {
				result.push((level > 1 ? 'iframe' + ( 'reasons' in keysToReturn ? ':' : '') : '') + values.join(''));
			}
		}
		if (obj.children && obj.children.length > 0) {
			obj.children.forEach(function(child) {
				extractKeys(child, 1 + level);
			});
		}
	}
	if (obj.children && obj.children.length > 0) {
		obj.children.forEach(function(child) {
			extractKeys(child, 1);
		});
	}
	return result;
}

function bfCacheNotRestored( nav ) {
	if ( nav.type != 'back_forward' ) {
        console.warn('no back forward detected');
		return;
	}
	if ( !nav.notRestoredReasons ) {
        console.warn('notRestoredReasons not supported by this browser');
		return;
	}
	// Clause function that checks if this frame caused bfcache to be blocked
	function isBlocked(obj) {
		// https://github.com/WICG/bfcache-not-restored-reason/issues/2#issuecomment-2014301872
		return obj?.reasons?.length;
	}
	const notRestored = {
		elements: getKeysWithClause( { children: [ nav.notRestoredReasons ] }, isBlocked, {'id':'#%s', 'name':'[name=%s]'} ),
		reasons: getKeysWithClause( { children: [ nav.notRestoredReasons ] }, isBlocked, {'reasons':', '} ),
	};

	for ( const k in notRestored ) {
		if ( notRestored[k].length ) {
			console.log( 'notRestoredReasons', k, notRestored[k].join(';') );
		}
	}
}

const nav = performance.getEntriesByType('navigation')[0];
bfCacheNotRestored( nav );