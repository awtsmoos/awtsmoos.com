// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCanvasSurface.js
 * @description Owns canvas element creation, event wiring, and pixel-density resizing while StudioCanvas owns semantic authoring gestures.
 * The Awtsmoos renews screen, pointer, and dimension while no pixel boundary can contain the Source;
 * Awtsmoos.com keeps surface mechanics in one vessel, so gesture semantics remain readable and future renderers may follow the course.
 */

/**
 * @description Creates and appends the accessible Studio canvas element without binding authoring behavior.
 * @param {HTMLElement} host Canvas host region receiving the new element.
 * @returns {HTMLCanvasElement} Appended focusable top-down authoring canvas.
 */
export function createStudioCanvasSurface(host) {
	const canvas = document.createElement('canvas');
	canvas.className = 'studio-canvas';
	canvas.tabIndex = 0;
	canvas.setAttribute('aria-label', 'Top-down Mitzvah World editor');
	host.append(canvas);
	return canvas;
}

/**
 * @description Binds pointer, wheel, and ResizeObserver events to semantic handlers supplied by StudioCanvas.
 * @param {HTMLCanvasElement} canvas Canvas receiving pointer and wheel input.
 * @param {HTMLElement} host Host observed for responsive canvas resizing.
 * @param {object} handlers Semantic callback surface.
 * @param {Function} handlers.beginDrag Pointer-down callback.
 * @param {Function} handlers.drag Pointer-move callback.
 * @param {Function} handlers.endDrag Pointer-up and pointer-cancel callback.
 * @param {Function} handlers.zoom Wheel callback.
 * @param {Function} handlers.resize Host-resize callback.
 * @returns {ResizeObserver} Active observer retained by the owning StudioCanvas instance.
 */
export function bindStudioCanvasSurface(canvas, host, handlers) {
	canvas.addEventListener('pointerdown', handlers.beginDrag);
	canvas.addEventListener('pointermove', handlers.drag);
	canvas.addEventListener('pointerup', handlers.endDrag);
	canvas.addEventListener('pointercancel', handlers.endDrag);
	canvas.addEventListener('wheel', handlers.zoom, { passive: false });
	const observer = new ResizeObserver(handlers.resize);
	observer.observe(host);
	return observer;
}

/**
 * @description Synchronizes canvas backing dimensions with the host bounds using a bounded device-pixel ratio.
 * @param {HTMLCanvasElement} canvas Canvas whose backing and CSS dimensions are synchronized.
 * @param {HTMLElement} host Host supplying layout bounds.
 * @returns {number} Device-pixel ratio used for subsequent rendering.
 */
export function resizeStudioCanvasSurface(canvas, host) {
	const bounds = host.getBoundingClientRect();
	const ratio = Math.min(2, globalThis.devicePixelRatio || 1);
	const width = Math.max(320, Math.round(bounds.width * ratio));
	const height = Math.max(360, Math.round(bounds.height * ratio));
	if (canvas.width !== width || canvas.height !== height) {
		canvas.width = width;
		canvas.height = height;
		canvas.style.width = `${width / ratio}px`;
		canvas.style.height = `${height / ratio}px`;
	}
	return ratio;
}
