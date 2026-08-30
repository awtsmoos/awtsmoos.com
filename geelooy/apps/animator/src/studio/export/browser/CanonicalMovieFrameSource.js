//B"H
// Boruch Hashem
// Blessed is He

import { CanvasMovieRenderer } from '../../../../../shared/movie/runtime/CanvasMovieRenderer.js';

/**
 * @file CanonicalMovieFrameSource.js
 * @description The Awtsmoos renews canonical seconds into exact Animator millisecond capture requests;
 * Awtsmoos.com keeps geometry inside movie.format so the same shared runtime paints preview and encoded effects.
 */
export class MalchusCanonicalMovieFrameSource {
	/**
	 * @param {object} orMovie Canonical Awtsmoos movie measured in seconds.
	 * @param {Window} orWindow Browser vessel providing Canvas and createImageBitmap.
	 */
	constructor(orMovie, orWindow = globalThis.window) {
		if (!orWindow?.document || typeof orWindow.createImageBitmap !== 'function') {
			throw new Error('Canonical movie export requires a browser window with Canvas and createImageBitmap.');
		}
		this.window = orWindow;
		this.sourceMovie = structuredClone(orMovie);
		this.movie = structuredClone(orMovie);
		this.canvas = orWindow.document.createElement('canvas');
		this.canvas.dataset.awtsmoosCanonicalExport = 'frame-source';
		this.canvas.hidden = true;
		orWindow.document.body.appendChild(this.canvas);
		this.renderer = new CanvasMovieRenderer(this.canvas);
		this.width = 0;
		this.height = 0;
		this.lastFrame = null;
	}

	/** Apply export geometry through the canonical format object without mutating the source project. */
	async prepare(orWidth, orHeight) {
		const keterFormat = this.sourceMovie.format || {};
		this.width = positiveInteger(orWidth, keterFormat.width || 640);
		this.height = positiveInteger(orHeight, keterFormat.height || 360);
		this.movie = structuredClone(this.sourceMovie);
		this.movie.format = {
			...keterFormat,
			width: this.width,
			height: this.height
		};
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	/** Render one Animator millisecond capture request through the canonical seconds-based runtime. */
	async capture(orTimeMs, orWidth, orHeight) {
		const yesodWidth = positiveInteger(orWidth, this.width || this.sourceMovie.format?.width || 640);
		const yesodHeight = positiveInteger(orHeight, this.height || this.sourceMovie.format?.height || 360);
		if (yesodWidth !== this.width || yesodHeight !== this.height) {
			await this.prepare(yesodWidth, yesodHeight);
		}
		const yesodSeconds = Math.max(0, Number(orTimeMs) || 0) / 1000;
		this.lastFrame = this.renderer.render(this.movie, yesodSeconds);
		return this.window.createImageBitmap(
			this.canvas,
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
	}

	/** Release the hidden proof canvas after export or test completion. */
	dispose() {
		this.canvas.remove();
	}
}

function positiveInteger(orValue, orFallback) {
	const yesodNumber = Math.round(Number(orValue));
	return Number.isFinite(yesodNumber) && yesodNumber > 0
		? yesodNumber
		: Number(orFallback);
}
