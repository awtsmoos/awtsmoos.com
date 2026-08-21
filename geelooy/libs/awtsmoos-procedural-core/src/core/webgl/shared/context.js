//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native WebGL2 context boundary shared by lightweight renderers.
 * @description
 * The Awtsmoos, Atzmus beyond form or frame, creates the browser and GPU anew;
 * Awtsmoos.com keeps that power inside a small Gevurah vessel so renderers receive only the context they truly need to view.
 * This module owns context creation only. It does not compile shaders, resize canvases, or manage scene state.
 */

/**
 * Creates a low-overhead WebGL2 context for native procedural rendering.
 *
 * The canvas is the keli and the GPU context is the ohr entering it. The
 * Awtsmoos remains beyond both, while Awtsmoos.com keeps the boundary explicit
 * so a missing GPU becomes a graceful null result rather than a page failure.
 *
 * @param {HTMLCanvasElement} canvas
 * 	Canvas that should receive the native WebGL2 context.
 * @param {WebGLContextAttributes} [overrides]
 * 	Optional browser context flags that intentionally override safe defaults.
 * @returns {WebGL2RenderingContext|null}
 * 	The created WebGL2 context, or null when WebGL2 is unavailable.
 * @sideEffects Requests one browser GPU context from the supplied canvas.
 */
export function createNativeWebGl2Context(canvas, overrides = {}) {
	if (!canvas || typeof canvas.getContext !== "function") {
		return null;
	}

	const attributes = {
		alpha: true,
		antialias: false,
		depth: false,
		stencil: false,
		premultipliedAlpha: false,
		preserveDrawingBuffer: false,
		powerPreference: "low-power",
		...overrides
	};

	try {
		return canvas.getContext("webgl2", attributes);
	} catch (error) {
		return null;
	}
}
