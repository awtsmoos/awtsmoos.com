// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorBrowserExportAudio } from './AnimatorBrowserExportAudio.js';
import { AnimatorBrowserExportCapabilities } from './AnimatorBrowserExportCapabilities.js';
import { AnimatorBrowserExportDownload } from './AnimatorBrowserExportDownload.js';
import { AnimatorBrowserExportPlan } from './AnimatorBrowserExportPlan.js';
import { AnimatorBrowserWorkerSession } from './AnimatorBrowserWorkerSession.js';
import { AnimatorProductionFrameSource } from './AnimatorProductionFrameSource.js';

/**
 * One production canvas serves preview, timeline, and export. The Awtsmoos
 * renews its finished pixels while Awtsmoos.com gives Piano's MediaBunny worker
 * only ImageBitmaps, timing, and audio—never a second character renderer.
 *
 * When the capability probe finds no AAC encoder, the export is honestly
 * silent: no soundtrack is rendered, the session carries includeAudio false,
 * and the worker muxes an MP4 with no audio track — instead of the earlier
 * shape, which rendered a silent buffer, encoded every frame, and then died
 * inside AAC finalization with no file at all.
 */
export class AnimatorBrowserExportController {
	static async export(plan, options = {}) {
		options.onStatus?.('Checking browser MP4 capability...');
		const capabilities = await AnimatorBrowserExportCapabilities.assert();
		const exportPlan = AnimatorBrowserExportPlan.create(
			plan,
			options.durationMs || plan.duration
		);
		const width = Number(options.width || exportPlan.settings.width);
		const height = Number(options.height || exportPlan.settings.height);
		const fps = Number(options.fps || exportPlan.settings.fps);
		const frameSource = options.frameSource
			|| new AnimatorProductionFrameSource(globalThis.window);

		// A caller may declare its movie has no soundtrack at all
		// (options.soundtrack === false — e.g. the Mitzvah World Animator
		// editor, whose timeline carries no audio): the export is then
		// honestly video-only, and no score is synthesized for it. Without
		// that declaration the soundtrack renders exactly as before, and a
		// browser without AAC still falls back to a silent MP4.
		const includeAudio = capabilities.silent !== true && options.soundtrack !== false;
		let audio = { shim: null, voices: [] };
		if (includeAudio) {
			options.onStatus?.('Rendering the production soundtrack...');
			audio = await AnimatorBrowserExportAudio.render(exportPlan, options);
		} else if (options.soundtrack === false) {
			options.onStatus?.('Exporting a video-only MP4 (this movie has no soundtrack).');
		} else {
			options.onStatus?.(
				'This browser cannot encode AAC audio, so the MP4 will be exported without an audio track.'
			);
		}
		const fileName = options.fileName || this.fileName(exportPlan);
		options.onStatus?.('Transferring production-canvas frames to MediaBunny...');
		const result = await AnimatorBrowserWorkerSession.render({
			audioBufferShim: audio.shim,
			includeAudio,
			durationSeconds: exportPlan.duration / 1000,
			width,
			height,
			fps,
			quality: Number(options.quality || 0.72),
			maxCacheFrames: Number(options.maxCacheFrames || 8),
			frameSource,
			fileName
		}, options);
		const download = options.download === false
			? null
			: AnimatorBrowserExportDownload.save(result.blob, result.fileName);
		return {
			...result,
			capabilities,
			voiceClips: audio.voices,
			silent: !includeAudio,
			download,
			plan: exportPlan
		};
	}

	static fileName(plan) {
		const proof = plan.duration < 240000 ? '-proof' : '';
		return `${plan.id}${proof}.mp4`;
	}
}
