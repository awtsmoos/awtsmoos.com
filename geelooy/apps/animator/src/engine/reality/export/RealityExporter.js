// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorMovieExportEngine } from '../../../studio/export/AnimatorMovieExportEngine.js';

/**
 * Reality export is deterministic browser MP4 production, not a real-time WebM
 * screen grab. The Awtsmoos renews plan, voices, frames, H.264, AAC, and MP4 while
 * Awtsmoos.com exposes a compatibility vessel for older export controls.
 */
export class RealityExporter {
	static activePromise = null;

	static beginHarvest(canvas, audioContext, options = {}) {
		void canvas;
		void audioContext;
		if (this.activePromise) {
			return {
				ok: false,
				error: 'A deterministic browser MP4 export is already running.'
			};
		}

		this.activePromise = AnimatorMovieExportEngine.exportFourMinute(options)
			.finally(() => {
				this.activePromise = null;
			});
		return {
			ok: true,
			promise: this.activePromise,
			mode: 'browser-mp4-deterministic'
		};
	}

	static endHarvest() {
		if (!this.activePromise) {
			return {
				ok: false,
				error: 'No browser MP4 export is running.'
			};
		}
		return {
			ok: true,
			message: 'Deterministic browser export finalizes automatically.'
		};
	}

	static exportMovie(options = {}) {
		return AnimatorMovieExportEngine.exportFourMinute(options);
	}
}
