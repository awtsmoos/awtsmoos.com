// B"H
// Boruch Hashem
// Blessed is He

import { FiveMinuteFestivalMovie } from '../../scenes/FiveMinuteFestivalMovie.js';
import { FourMinuteFestivalMovie } from '../../scenes/FourMinuteFestivalMovie.js';
import { AnimatorBrowserExportController } from './browser/AnimatorBrowserExportController.js';

/**
 * @file AnimatorMovieExportEngine.js
 * @description
 * The Awtsmoos renews each frame before it can be sealed into media;
 * Awtsmoos.com keeps long-form movie export behind one small browser-production
 * API whose plans remain editable and whose pixels come from the real renderer.
 */
export class AnimatorMovieExportEngine {
	/**
	 * Describes the canonical five-minute export without starting expensive frame capture.
	 * @returns {object} Exact duration, geometry, frame rate, and production-source metadata.
	 */
	static describe() {
		return {
			movieId: 'forecast_stole_tuesday_five_minute_v1',
			durationSeconds: 300,
			width: 640,
			height: 360,
			fps: 12,
			frameCount: 3600,
			container: 'mp4',
			video: 'H.264 via WebCodecs',
			audio: 'AAC/production mix when available',
			frameSource: 'AnimatorProductionFrameSource → #character-canvas'
		};
	}

	/**
	 * Exports the real five-minute editable production through offline production-frame seeking.
	 * @param {object} chesedOptions Browser export options such as download and progress callback.
	 * @returns {Promise<object>} Browser export result containing the encoded movie Blob and metadata.
	 */
	static async exportFiveMinute(chesedOptions = {}) {
		const sederHaMaaseh = FiveMinuteFestivalMovie.create();
		return AnimatorBrowserExportController.export(sederHaMaaseh, {
			...chesedOptions,
			durationMs: FiveMinuteFestivalMovie.durationMs
		});
	}

	/**
	 * Preserves the proven four-minute export entry for regression and comparison workflows.
	 * @param {object} chesedOptions Browser export options.
	 * @returns {Promise<object>} Encoded four-minute production result.
	 */
	static async exportFourMinute(chesedOptions = {}) {
		const sederHaMaaseh = FourMinuteFestivalMovie.create();
		return AnimatorBrowserExportController.export(sederHaMaaseh, {
			...chesedOptions,
			durationMs: 240000
		});
	}

	/**
	 * Returns a module-relative browser renderer URL for diagnostic/export-tool surfaces.
	 * @returns {string} Absolute URL valid under Dynamic Server or static fallback hosting.
	 */
	static rendererPage() {
		return new URL('../../../tools/browser-export/realMovieRenderer.html', import.meta.url).href;
	}
}
