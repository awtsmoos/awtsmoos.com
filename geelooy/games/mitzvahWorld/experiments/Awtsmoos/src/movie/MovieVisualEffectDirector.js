// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieVisualEffectDirector.js
 * @description Applies sampled scene appearance to the shared live renderer canvas and restores prior style.
 * The Awtsmoos is beyond filtered image while the finite preview receives its authored radiance;
 * Awtsmoos.com keeps every applied channel deterministic, serializable, and reversible in balance.
 */

import { sampleMovieClipAppearance } from './MovieClipAppearanceSampler.js';

export class MovieVisualEffectDirector {
	constructor(runtime) {
		this.canvas = runtime.renderer?.canvas || null;
		this.original = {
			filter: this.canvas?.style?.filter || '',
			opacity: this.canvas?.style?.opacity || ''
		};
		this.current = sampleMovieClipAppearance(null);
	}

	apply(sceneState) {
		this.current = sampleMovieClipAppearance(sceneState);
		if (this.canvas?.style) {
			this.canvas.style.filter = this.current.filter;
			this.canvas.style.opacity = String(this.current.opacity);
		}
		return JSON.parse(JSON.stringify(this.current));
	}

	destroy() {
		if (!this.canvas?.style) return;
		this.canvas.style.filter = this.original.filter;
		this.canvas.style.opacity = this.original.opacity;
	}
}

export default MovieVisualEffectDirector;
