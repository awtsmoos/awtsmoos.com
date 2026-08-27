// B"H
// Boruch Hashem
// Blessed is He

import { FourMinuteFestivalMovie } from '../../scenes/FourMinuteFestivalMovie.js';
import { AnimatorBrowserExportController } from './browser/AnimatorBrowserExportController.js';
import { AnimatorBrowserExportCapabilities } from './browser/AnimatorBrowserExportCapabilities.js';

/**
 * Animator follows Piano's browser-video covenant: WebCodecs creates ordered
 * H.264 and AAC samples, MediaBunny muxes MP4, and browser audio renders every
 * voice. Planning methods return browser metadata, never executable commands.
 */
export class AnimatorMovieExportEngine {
	static describe() {
		return {
			source: 'Piano MediaBunnyBase browser worker',
			container: 'MP4',
			video: 'WebCodecs H.264',
			audio: 'WebCodecs AAC from OfflineAudioContext',
			durationSeconds: 240,
			resolution: '640x360',
			fps: 12,
			fileName: 'the-forecast-that-stole-tuesday-browser.mp4',
			productionEncoder: 'browser-only'
		};
	}

	static capabilities() {
		return AnimatorBrowserExportCapabilities.inspect();
	}

	static oneMinutePlan(production = {}) {
		return {
			mode: 'browser-mp4-proof',
			sourceTitle: String(production.title || 'Original Cartoon'),
			durationMs: 60000,
			container: 'MP4',
			video: 'WebCodecs H.264',
			audio: 'WebCodecs AAC',
			resolution: { width: 640, height: 360 },
			fps: 12,
			shotCount: Number(production.shots?.length || 0),
			beatCount: Number(production.beats?.length || 0),
			rendererPage: '/geelooy/apps/animator/tools/browser-export/realMovieRenderer.html',
			fileName: 'awtsmoos-browser-proof.mp4',
			productionEncoder: 'browser-only'
		};
	}

	static exportFourMinute(options = {}) {
		return AnimatorBrowserExportController.export(
			FourMinuteFestivalMovie.create(),
			{
				...options,
				durationMs: options.durationMs || 240000,
				fileName: options.fileName
					|| 'the-forecast-that-stole-tuesday-browser.mp4'
			}
		);
	}
}
