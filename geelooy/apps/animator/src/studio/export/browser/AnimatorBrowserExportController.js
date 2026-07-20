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

		options.onStatus?.('Rendering the production soundtrack...');
		const audio = await AnimatorBrowserExportAudio.render(exportPlan, options);
		const fileName = options.fileName || this.fileName(exportPlan);
		options.onStatus?.('Transferring production-canvas frames to MediaBunny...');
		const result = await AnimatorBrowserWorkerSession.render({
			audioBufferShim: audio.shim,
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
			download,
			plan: exportPlan
		};
	}

	static fileName(plan) {
		const proof = plan.duration < 240000 ? '-proof' : '';
		return `${plan.id}${proof}.mp4`;
	}
}
