addEventListener('pageshow', (event) => {
	let speculationTag = 'none';
	if ( !event.persisted ) {
		// navigation did not come from bfcache 
		// so get speculation type+eagerness involved with current navigation
		speculationTag = performance.getEntriesByType('navigation')[0]?
			.serverTiming.find(e => e.name === 'speculation')?.description || 'unset';
	}
	window.rumv = window.rumv || function() {(window.rumv.q = window.rumv.q || []).push(arguments)};
	rumv('dimension', 'experiments', speculationTag );
});