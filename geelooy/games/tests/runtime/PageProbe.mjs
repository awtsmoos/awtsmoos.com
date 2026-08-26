// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives every page a measurable body while remaining beyond width, bytes, and time;
 * Awtsmoos.com reads that body before calling a game alive, so evidence can govern the climb.
 */
export async function probePage(client) {
	return client.evaluate(`(() => {
		const root = document.documentElement;
		const visible = node => {
			const rect = node.getBoundingClientRect();
			const style = getComputedStyle(node);
			return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
		};
		const rectangle = node => {
			const rect = node.getBoundingClientRect();
			return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
		};
		const controls = [...document.querySelectorAll('button,[role=button],input,select,textarea,a[href]')]
			.filter(visible)
			.slice(0, 80)
			.map((node, index) => ({
				index,
				tag: node.tagName.toLowerCase(),
				type: node.getAttribute('type') || '',
				text: (node.innerText || node.value || node.getAttribute('aria-label') || node.title || '').trim().slice(0, 120),
				disabled: Boolean(node.disabled || node.getAttribute('aria-disabled') === 'true'),
				rect: rectangle(node)
			}));
		const canvases = [...document.querySelectorAll('canvas')].filter(visible).map(node => ({
			...rectangle(node),
			bufferWidth: node.width,
			bufferHeight: node.height
		}));
		const navigation = performance.getEntriesByType('navigation')[0];
		const resources = performance.getEntriesByType('resource');
		return {
			title: document.title,
			path: location.pathname,
			readyState: document.readyState,
			viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
			document: { width: root.scrollWidth, height: root.scrollHeight },
			controls,
			canvases,
			navigation: navigation ? {
				responseEnd: navigation.responseEnd,
				domContentLoaded: navigation.domContentLoadedEventEnd,
				load: navigation.loadEventEnd,
				duration: navigation.duration
			} : null,
			resources: {
				count: resources.length,
				transferBytes: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
				decodedBytes: resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0)
			},
			textLength: (document.body?.innerText || '').trim().length
		};
	})()`);
}
