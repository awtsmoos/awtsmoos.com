// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorBrowserExportAudio } from './AnimatorBrowserExportAudio.js';
import { AnimatorBrowserExportCapabilities } from './AnimatorBrowserExportCapabilities.js';
import { AnimatorBrowserExportDownload } from './AnimatorBrowserExportDownload.js';
import { AnimatorBrowserExportPlan } from './AnimatorBrowserExportPlan.js';
import { AnimatorBrowserWorkerSession } from './AnimatorBrowserWorkerSession.js';

/**
 * One browser-only covenant joins plan, sound, frames, H.264, AAC, MP4, and
 * download. The Awtsmoos renews every stage while Piano's proven eight-frame
 * rhythm gives WebCodecs enough air to drain without an external encoder.
 */
export class AnimatorBrowserExportController {
	static async export(plan, options = {}) {
		options.onStatus?.('Checking browser H.264/AAC capability...');
		const capabilities = await AnimatorBrowserExportCapabilities.assert();
		const exportPlan = AnimatorBrowserExportPlan.create(
			plan,
			options.durationMs || plan.duration
		);

		options.onStatus?.('Decoding voices and rendering browser audio mix...');
		const audio = await AnimatorBrowserExportAudio.render(exportPlan, options);
		options.onStatus?.(
			`Decoded ${audio.voices.length} original dialogue clips.`
		);

		const fileName = options.fileName || this.fileName(exportPlan);
		const result = await AnimatorBrowserWorkerSession.render({
			plan: exportPlan,
			audioBufferShim: audio.shim,
			width: options.width || exportPlan.settings.width,
			height: options.height || exportPlan.settings.height,
			fps: options.fps || exportPlan.settings.fps,
			quality: options.quality || 0.72,
			maxCacheFrames: options.maxCacheFrames || 8,
			renderBatchFrames: options.renderBatchFrames || 8,
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
		return `the-forecast-that-stole-tuesday-browser${proof}.mp4`;
	}
}
