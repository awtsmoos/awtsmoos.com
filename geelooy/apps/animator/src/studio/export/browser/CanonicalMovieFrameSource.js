//B"H
// Boruch Hashem
// Blessed is He

import { CanvasMovieRenderer } from '../../../../../shared/movie/runtime/CanvasMovieRenderer.js';

/**
 * @file CanonicalMovieFrameSource.js
 * @description The Awtsmoos renews one semantic movie at each exact millisecond and reveals transferable pixels;
 * Awtsmoos.com preserves the canonical schema while Animator requests export geometry through its existing frame contract.
 */
export class MalchusCanonicalMovieFrameSource {
	/**
	 * @param {object} orMovie Canonical Awtsmoos movie whose timeline is measured in milliseconds.
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

	/** Sets requested export geometry in settings while preserving the canonical `format` string. */
	async prepare(orWidth, orHeight) {
		this.width = positiveInteger(orWidth, this.sourceMovie.settings?.width || 640);
		this.height = positiveInteger(orHeight, this.sourceMovie.settings?.height || 360);
		this.movie = structuredClone(this.sourceMovie);
		this.movie.settings = {
			...(this.movie.settings || {}),
			width: this.width,
			height: this.height
		};
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	}

	/** Renders one exact Animator millisecond request and returns a transferable ImageBitmap. */
	async capture(orTimeMs, orWidth, orHeight) {
		const yesodWidth = positiveInteger(orWidth, this.width || 640);
		const yesodHeight = positiveInteger(orHeight, this.height || 360);
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

	/** Releases the hidden proof canvas after export or test completion. */
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
