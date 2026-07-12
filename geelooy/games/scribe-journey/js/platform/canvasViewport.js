// B"H

const MAX_DEVICE_PIXEL_RATIO = 2;

/**
 * Keeps the visible world and its backing pixels in covenant. The canvas speaks
 * in CSS-sized logical units while the hidden backing store honors sharp screens.
 */
export function createCanvasViewport(canvas, viewportElement) {
	const context = canvas.getContext('2d');
	let destroyed = false;

	const resize = () => {
		if (destroyed) return;
		const bounds = viewportElement.getBoundingClientRect();
		const logicalWidth = Math.max(1, Math.round(bounds.width));
		const logicalHeight = Math.max(1, Math.round(bounds.height));
		const dpr = Math.min(MAX_DEVICE_PIXEL_RATIO, Math.max(1, window.devicePixelRatio || 1));
		const backingWidth = Math.round(logicalWidth * dpr);
		const backingHeight = Math.round(logicalHeight * dpr);

		if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
			canvas.width = backingWidth;
			canvas.height = backingHeight;
		}
		canvas.__logicalWidth = logicalWidth;
		canvas.__logicalHeight = logicalHeight;
		canvas.__dpr = dpr;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);
		context.imageSmoothingEnabled = false;
	};

	const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
	observer?.observe(viewportElement);
	window.addEventListener('resize', resize);
	window.visualViewport?.addEventListener('resize', resize);
	resize();

	return {
		context,
		resize,
		destroy() {
			destroyed = true;
			observer?.disconnect();
			window.removeEventListener('resize', resize);
			window.visualViewport?.removeEventListener('resize', resize);
		}
	};
}
