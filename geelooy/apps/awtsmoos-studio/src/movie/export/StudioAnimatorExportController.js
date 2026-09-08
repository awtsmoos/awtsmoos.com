//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAnimatorExportController.js
 * @description Sends Studio's exact native-composite frames and durable imported soundtrack through Animator's proven MP4 worker.
 * The Awtsmoos renews one movie before renderer or encoder receives a name; Awtsmoos.com lets Studio own pixels and sound while Animator owns encoding, all under one canonical document.
 */
import { gevurahAssertValidMovie, yesodCreateRenderManifest } from '../../../../shared/movie/index.js';
import { AnimatorMovieAdapter } from '../../../../animator/src/sharedMovie/AnimatorMovieAdapter.js';
import { AnimatorBrowserExportCapabilities } from '../../../../animator/src/studio/export/browser/AnimatorBrowserExportCapabilities.js';
import { AnimatorBrowserExportDownload } from '../../../../animator/src/studio/export/browser/AnimatorBrowserExportDownload.js';
import { AnimatorBrowserExportPlan } from '../../../../animator/src/studio/export/browser/AnimatorBrowserExportPlan.js';
import { MalchusCanonicalMovieBrowserExport } from '../../../../animator/src/studio/export/browser/CanonicalMovieBrowserExport.js';
import { YesodCanonicalMovieExportPlan } from '../../../../animator/src/studio/export/browser/CanonicalMovieExportPlan.js';
import { AnimatorBrowserWorkerSession } from '../../../../animator/src/studio/export/browser/AnimatorBrowserWorkerSession.js';
import { StudioAudioAssetStore } from '../../media/StudioAudioAssetStore.js';
import { renderStudioExportAudio, STUDIO_EXPORT_AUDIO_RATE } from './StudioExportAudio.js';
import { StudioNativeExportFrameSource } from './StudioNativeExportFrameSource.js';

export class StudioAnimatorExportController {
	static async export(movie, options = {}) {
		gevurahAssertValidMovie(movie);
		const projection = AnimatorMovieAdapter.project(movie);
		const canonicalPlan = YesodCanonicalMovieExportPlan.create(movie, projection.plan);
		const profile = MalchusCanonicalMovieBrowserExport.profile(movie, options);
		const durationMs = finiteDuration(options.durationMs, canonicalPlan.duration);
		const exportPlan = AnimatorBrowserExportPlan.create(canonicalPlan, durationMs);
		options.onStatus?.('Checking native Studio MP4 capability...');
		const capabilities = await AnimatorBrowserExportCapabilities.assert();
		const frameSource = options.frameSource || new StudioNativeExportFrameSource(movie, options);
		const ownsFrameSource = !options.frameSource;
		try {
			options.onStatus?.(options.includeAudio === false ? 'Preparing silent soundtrack...' : 'Mixing imported Studio soundtrack...');
			const audioBufferShim = options.audioBufferShim || await audioFor(movie, exportPlan, options);
			options.onStatus?.('Encoding native Studio frames with Animator...');
			const result = await AnimatorBrowserWorkerSession.render({
				audioBufferShim,
				durationSeconds: exportPlan.duration / 1000,
				width: Number(options.width || profile.width),
				height: Number(options.height || profile.height),
				fps: Number(options.fps || profile.fps),
				quality: Number(options.quality || profile.quality),
				maxCacheFrames: Number(options.maxCacheFrames || 8),
				frameSource,
				fileName: options.fileName || `${movie.id}.mp4`
			}, options);
			const download = options.download === false ? null : AnimatorBrowserExportDownload.save(result.blob, result.fileName);
			return { ...result, capabilities, download, plan: exportPlan,
				canonicalMovie: structuredClone(movie), adapterReport: structuredClone(projection.report),
				manifest: yesodCreateRenderManifest(movie, { id: 'awtsmoos-studio-native-composite' }, profile) };
		} finally {
			if (ownsFrameSource) frameSource.dispose?.();
		}
	}
}

async function audioFor(movie, plan, options) {
	const seconds = plan.duration / 1000;
	if (options.includeAudio === false) return silentStereo(seconds);
	return renderStudioExportAudio(movie, options.audioAssetStore || new StudioAudioAssetStore(), seconds, options);
}
function silentStereo(seconds) {
	const length = Math.max(1, Math.ceil(seconds * STUDIO_EXPORT_AUDIO_RATE));
	return { sampleRate: STUDIO_EXPORT_AUDIO_RATE, length, duration: seconds,
		numberOfChannels: 2, channels: [new Float32Array(length), new Float32Array(length)] };
}
function finiteDuration(requested, fallback) {
	const duration = Number(requested ?? fallback);
	if (!Number.isFinite(duration) || duration <= 0) throw new Error('Studio export duration must be positive.');
	return Math.min(Math.round(duration), Math.round(Number(fallback)));
}
