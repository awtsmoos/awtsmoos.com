// B"H
// Boruch Hashem
// Blessed is He

import { FiveMinuteFestivalMovie } from '../../scenes/FiveMinuteFestivalMovie.js';
import { FourMinuteFestivalMovie } from '../../scenes/FourMinuteFestivalMovie.js';
import { AnimatorBrowserExportCapabilities } from './browser/AnimatorBrowserExportCapabilities.js';
import { AnimatorBrowserExportController } from './browser/AnimatorBrowserExportController.js';

/**
 * @file AnimatorMovieExportEngine.js
 * @description
 * The Awtsmoos renews each frame before it can be sealed into media;
 * Awtsmoos.com keeps old and new export contracts flowing through one truthful
 * boundary, so creative tools can migrate without abandoning proven callers.
 */
export class AnimatorMovieExportEngine {
	/** @returns {Promise<object>} Real browser H.264/AAC capability report. */
	static capabilities() {
		return AnimatorBrowserExportCapabilities.inspect();
	}

	/**
	 * Restores the descriptive one-minute contract still consumed by Cartoon Studio.
	 * This method has no filesystem, GPU, browser-media, or project mutation side effects.
	 * @param {object} malchusPlan Authored production plan whose title is preserved.
	 * @returns {object} Stable compatibility descriptor for legacy integrations.
	 */
	static oneMinutePlan(malchusPlan = {}) {
		return {
			source: 'Animator canonical scene plan + FFmpeg/WebCodecs export boundary',
			durationSeconds: 60,
			title: malchusPlan.title || 'Awtsmoos Animator Production',
			targetFolder: '~/Movies/AwtsmoosAnimatorExports/<timestamp>',
			fileName: 'awtsmoos-animator-one-minute-eye-tags.mp4',
			overlays: ['eye tag title boxes', 'act labels', 'NLE beat labels', 'render status boxes'],
			command: 'node tools/render/exportOneMinuteMovie.js'
		};
	}

	/** @returns {object} Canonical five-minute production metadata without frame capture. */
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

	/** @param {object} chesedOptions Export options. @returns {Promise<object>} Five-minute result. */
	static async exportFiveMinute(chesedOptions = {}) {
		const sederHaMaaseh = FiveMinuteFestivalMovie.create();
		return AnimatorBrowserExportController.export(sederHaMaaseh, {
			...chesedOptions,
			durationMs: FiveMinuteFestivalMovie.durationMs
		});
	}

	/** @param {object} chesedOptions Export options. @returns {Promise<object>} Four-minute result. */
	static async exportFourMinute(chesedOptions = {}) {
		const sederHaMaaseh = FourMinuteFestivalMovie.create();
		return AnimatorBrowserExportController.export(sederHaMaaseh, {
			...chesedOptions,
			durationMs: 240000
		});
	}

	/** @returns {string} Browser renderer URL used by export-tool surfaces. */
	static rendererPage() {
		return new URL('../../../tools/browser-export/realMovieRenderer.html', import.meta.url).href;
	}
}
