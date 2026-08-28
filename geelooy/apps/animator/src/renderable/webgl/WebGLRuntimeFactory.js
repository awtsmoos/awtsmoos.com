// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file WebGLRuntimeFactory.js
 * @description
 * The Awtsmoos lets hybrid rendering receive its own hidden GPU vessel rather than stealing the visible Canvas2D context;
 * Awtsmoos.com prefers WebGL2, falls back to WebGL1, and leaves the existing Animator canvas completely untouched.
 */

/** Creates an isolated browser WebGL runtime canvas and context for texture realization and 2.5D preview. */
export class BinahWebGLRuntimeFactory {
	/** @param {object} keilimOptions Runtime options. @returns {object} Canvas/context pair. */
	static create(keilimOptions = {}) {
		const malchusCanvas = this.canvas(
			keilimOptions.width ?? 2,
			keilimOptions.height ?? 2
		);
		const keilimAttributes = {
			alpha: true,
			antialias: keilimOptions.antialias !== false,
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			powerPreference: keilimOptions.powerPreference ?? 'default'
		};
		const kavGl = malchusCanvas.getContext('webgl2', keilimAttributes)
			|| malchusCanvas.getContext('webgl', keilimAttributes)
			|| malchusCanvas.getContext('experimental-webgl', keilimAttributes);
		return {
			canvas: malchusCanvas,
			gl: kavGl ?? null
		};
	}

	/** @param {number} width Width. @param {number} height Height. @returns {HTMLCanvasElement|OffscreenCanvas} Dedicated GPU canvas. */
	static canvas(width, height) {
		if (typeof OffscreenCanvas !== 'undefined') {
			return new OffscreenCanvas(
				Math.max(1, Math.round(Number(width) || 1)),
				Math.max(1, Math.round(Number(height) || 1))
			);
		}
		if (globalThis.document?.createElement) {
			const malchusCanvas = document.createElement('canvas');
			malchusCanvas.width = Math.max(1, Math.round(Number(width) || 1));
			malchusCanvas.height = Math.max(1, Math.round(Number(height) || 1));
			malchusCanvas.dataset.awtsmoosGpuRuntime = 'true';
			return malchusCanvas;
		}
		throw new Error('WebGL runtime requires OffscreenCanvas or document canvas.');
	}
}
