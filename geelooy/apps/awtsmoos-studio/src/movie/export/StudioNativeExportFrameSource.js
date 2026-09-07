//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioNativeExportFrameSource.js
 * @description Captures exact movie timestamps by compositing Studio's real native WebGL frame with its transparent portable Canvas2D overlays.
 * The Awtsmoos renews depth and sign in one cinematic instant while Awtsmoos.com refuses a lesser renderer at export time;
 * the same native preview waits for real Chossid assets, the same portable painter draws titles and transitions, and one bitmap enters Animator's encoder line.
 */

import { StudioMovieRenderer } from '../StudioMovieRenderer.js';
import { StudioNativePreview } from '../native/StudioNativePreview.js';

export class StudioNativeExportFrameSource {
	constructor(movie, options = {}) {
		this.movie = movie;
		this.canvasFactory = options.canvasFactory || defaultCanvasFactory;
		this.bitmapFactory = options.bitmapFactory || defaultBitmapFactory;
		this.previewFactory = options.nativePreviewFactory || (canvas => new StudioNativePreview(canvas));
		this.rendererFactory = options.movieRendererFactory || (canvas => new StudioMovieRenderer(canvas));
		this.nativeCanvas = null;
		this.portableCanvas = null;
		this.compositeCanvas = null;
		this.compositeContext = null;
		this.nativePreview = null;
		this.portableRenderer = null;
	}

	async prepare(width, height) {
		this.nativeCanvas = this.createCanvas(width, height);
		this.portableCanvas = this.createCanvas(width, height);
		this.compositeCanvas = this.createCanvas(width, height);
		this.compositeContext = this.compositeCanvas.getContext('2d');
		if (!this.compositeContext) throw new Error('Studio export requires a 2D composite canvas.');
		this.nativePreview = this.previewFactory(this.nativeCanvas);
		this.portableRenderer = this.rendererFactory(this.portableCanvas);
	}

	async capture(timeMs, width, height) {
		if (!this.nativePreview) await this.prepare(width, height);
		this.resize(width, height);
		const seconds = Math.max(0, Number(timeMs || 0) / 1000);
		let nativeRendered = this.nativePreview.render(
			this.movie,
			seconds,
			'hybrid',
			{ width, height, dpr: 1 }
		);
		if (this.nativeCanvas.dataset?.nativeError) {
			throw new Error(this.nativeCanvas.dataset.nativeError);
		}
		if (nativeRendered) {
			await this.nativePreview.settle();
			nativeRendered = this.nativePreview.render(
				this.movie,
				seconds,
				'hybrid',
				{ width, height, dpr: 1 }
			);
		}
		this.portableRenderer.render(this.movie, seconds, { overlayOnly: nativeRendered });
		this.compose(width, height, nativeRendered);
		return this.bitmapFactory(this.compositeCanvas);
	}

	dispose() {
		this.nativePreview?.dispose?.();
		this.nativePreview = null;
		this.portableRenderer = null;
		this.nativeCanvas = null;
		this.portableCanvas = null;
		this.compositeCanvas = null;
		this.compositeContext = null;
	}

	createCanvas(width, height) {
		const canvas = this.canvasFactory();
		canvas.width = width;
		canvas.height = height;
		return canvas;
	}

	resize(width, height) {
		for (const canvas of [this.nativeCanvas, this.portableCanvas, this.compositeCanvas]) {
			if (canvas.width !== width) canvas.width = width;
			if (canvas.height !== height) canvas.height = height;
		}
	}

	compose(width, height, nativeRendered) {
		this.compositeContext.clearRect(0, 0, width, height);
		if (nativeRendered) this.compositeContext.drawImage(this.nativeCanvas, 0, 0, width, height);
		this.compositeContext.drawImage(this.portableCanvas, 0, 0, width, height);
	}
}

function defaultCanvasFactory() {
	if (!globalThis.document?.createElement) throw new Error('Canvas creation is unavailable for Studio export.');
	return globalThis.document.createElement('canvas');
}

function defaultBitmapFactory(canvas) {
	if (!globalThis.createImageBitmap) throw new Error('ImageBitmap capture is unavailable for Studio export.');
	return globalThis.createImageBitmap(canvas);
}
