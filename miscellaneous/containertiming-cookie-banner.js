/**
 * This script dynamically injects a div, similar to how many third parties,
 * such as CMPs, add UI elements to a page.
 *
 * The injected div includes a `containertiming` attribute, so its presentation
 * can be reported through the Container Timing PerformanceObserver.
 */
 
new PerformanceObserver((list, observer) => {
	list.getEntries().forEach(entry => {
		console.log(entry);
	});
}).observe({
	type: 'container',
	buffered: true
});

function injectCmpContainerTiming(name = 'cmp-notice') {
	const cmp = document.createElement('div');

	cmp.setAttribute('containertiming', name);
	cmp.setAttribute('data-container-timing-until', JSON.stringify({
		entries: 2,
		interactions: 1,
		value: 'presentationTime'
	}));

	cmp.id = 'test-cmp-notice';
	cmp.innerHTML = `
		<div style="font: 14px/1.4 system-ui, sans-serif;">
			<strong>We use cookies</strong>
			<p style="margin: 8px 0 12px;">
				This is a fake CMP notice injected for Container Timing testing.
			</p>
			<button type="button">Accept</button>
			<button type="button">Manage preferences</button>
		</div>
	`;

	Object.assign(cmp.style, {
		position: 'fixed',
		left: '24px',
		right: '24px',
		bottom: '24px',
		zIndex: '2147483647',
		padding: '20px',
		background: '#fff',
		color: '#111',
		border: '1px solid #ddd',
		borderRadius: '12px',
		boxShadow: '0 8px 32px rgba(0,0,0,.18)',
		maxWidth: '520px'
	});

	document.body.appendChild(cmp);

	console.log('[ContainerTiming] Injected fake CMP notice:', cmp);

	return cmp;
}

injectCmpContainerTiming();