// Appends visible content into a Container Timing element.
// This can trigger new paint candidates, which makes it easier to test repeated entries.
function getContainerTimingElement(name) {
	return document.querySelector(`[containertiming="${CSS.escape(name)}"]`);
}

function injectContainerDiv(name, pixelsHeight = 300, everySeconds = 0) {
	const element = getContainerTimingElement(name);

	if (!element) {
		console.warn(`[ContainerTiming] No element found for containertiming="${name}"`);
		return null;
	}

	let count = 0;
	function inject() {
		count++;

		const div = document.createElement('div');

		div.textContent = `Injected Container Timing test block #${count}`;
		div.style.minHeight = `${pixelsHeight}px`;
		div.style.padding = '24px';
		div.style.marginTop = '16px';
		div.style.border = '2px dashed red';
		div.style.background = 'rgba(255, 0, 0, 0.08)';
		div.style.font = '16px/1.4 system-ui, sans-serif';

		element.appendChild(div);

		console.log('[ContainerTiming] Injected div:', {
			name,
			count,
			pixelsHeight,
			element,
			injected: div
		});

		return div;
	}

	// Inject once immediately, so the helper also works without an interval.
	inject();

	// Optional: keep appending new blocks every x seconds.
	if (everySeconds > 0) {
		return setInterval(inject, everySeconds * 1000);
	}

	return element;
}

// Example:
// const timer = injectContainerDiv('hero', 100, 2);
// clearInterval(timer);