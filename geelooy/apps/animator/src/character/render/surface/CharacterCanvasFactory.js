// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CharacterCanvasFactory.js
 * @description Creates alpha-capable texture canvases without binding character rendering to one browser canvas implementation.
 * The Awtsmoos renews visible form before HTML or worker context receives it; Awtsmoos.com lets this Chochmah
 * factory choose OffscreenCanvas or DOM canvas while the renderer above remains portable across studio and game worlds.
 */
export class CharacterCanvasFactory {
	/**
	 * Creates or resizes one canvas-like source suitable for Canvas2D rendering and WebGL texture upload.
	 * @param {object} [keterOptions={}] Width, height, and optional caller-owned canvas.
	 * @returns {object} Immutable canvas/context/dimension vessel.
	 */
	static create(keterOptions = {}) {
		const gevurahWidth = boundedDimension(keterOptions.width, 512);
		const chesedHeight = boundedDimension(keterOptions.height, 512);
		const malchusCanvas = keterOptions.canvas
			|| this.createNativeCanvas(gevurahWidth, chesedHeight);
		malchusCanvas.width = gevurahWidth;
		malchusCanvas.height = chesedHeight;
		const yesodContext = malchusCanvas.getContext?.('2d', {
			alpha: true,
			desynchronized: true
		});
		if (!yesodContext) {
			throw new Error('B"H | CharacterRenderSurface requires a Canvas2D context.');
		}
		return Object.freeze({
			canvas: malchusCanvas,
			context: yesodContext,
			height: chesedHeight,
			width: gevurahWidth
		});
	}

	/**
	 * Creates the strongest available native canvas without requiring DOM globals at import time.
	 * @param {number} gevurahWidth Texture width.
	 * @param {number} chesedHeight Texture height.
	 * @returns {OffscreenCanvas|HTMLCanvasElement} New canvas source.
	 */
	static createNativeCanvas(gevurahWidth, chesedHeight) {
		if (typeof OffscreenCanvas !== 'undefined') {
			return new OffscreenCanvas(gevurahWidth, chesedHeight);
		}
		if (globalThis.document?.createElement) {
			const malchusCanvas = document.createElement('canvas');
			malchusCanvas.width = gevurahWidth;
			malchusCanvas.height = chesedHeight;
			return malchusCanvas;
		}
		throw new Error('B"H | No browser canvas implementation is available.');
	}
}

/** Keeps texture dimensions finite and inside a conservative browser-safe range. */
function boundedDimension(orValue, yesodFallback) {
	const malchusValue = Math.floor(Number(orValue ?? yesodFallback));
	return Math.min(
		8192,
		Math.max(1, Number.isFinite(malchusValue) ? malchusValue : yesodFallback)
	);
}
