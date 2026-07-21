// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the visible vessel even after loss. This Awtsmoos.com
 * context helper creates WebGL2 honestly and sizes it within a measured budget.
 */

/**
 * Creates a browser-native WebGL2 context.
 * @param {HTMLCanvasElement} canvas Rendering canvas.
 * @returns {WebGL2RenderingContext|null}
 */
export function createWebGL2Context(canvas) {
	return canvas.getContext("webgl2", {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		powerPreference: "high-performance"
	});
}

/**
 * Resizes the canvas with a clamped pixel ratio.
 * @param {HTMLCanvasElement} canvas Rendering canvas.
 * @param {WebGL2RenderingContext} gl WebGL context.
 * @param {number} maximumPixelRatio Profile limit.
 * @returns {{width:number,height:number,ratio:number,changed:boolean}}
 */
export function resizeWebGLCanvas(canvas, gl, maximumPixelRatio) {
	const ratio = Math.min(window.devicePixelRatio || 1, maximumPixelRatio);
	const width = Math.max(1, Math.floor(canvas.clientWidth * ratio));
	const height = Math.max(1, Math.floor(canvas.clientHeight * ratio));
	const changed = canvas.width !== width || canvas.height !== height;
	if (changed) {
		canvas.width = width;
		canvas.height = height;
		gl.viewport(0, 0, width, height);
	}
	return { width, height, ratio, changed };
}
