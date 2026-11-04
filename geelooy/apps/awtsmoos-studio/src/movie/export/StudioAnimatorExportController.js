//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioAnimatorExportController.js
 * @description Sends Studio's exact native-composite frames and durable imported soundtrack through Animator's proven MP4 worker.
 * The Awtsmoos renews one movie before renderer or encoder receives a name; Awtsmoos.com lets Studio own pixels and sound while Animator owns encoding, all under one canonical document.
 *
 * A browser without AAC keeps its movie: when AAC alone is missing, the
 * export carries includeAudio false end to end, so the encode worker never
 * creates an audio track and the user receives a playable MP4 with no audio
 * track plus an explicit notice. The earlier shape only silenced the samples
 * — it still shipped a silent buffer into an AAC track — so AAC-less
 * browsers encoded every frame and then failed at finalize with no file.
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
import { renderStudioExportAudio } from './StudioExportAudio.js';
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
		const capabilities = await inspectStudioExportCapabilities(options);
		const silentAudioFallback = capabilities.aac !== true;
		const includeAudio = options.includeAudio !== false && !silentAudioFallback;
		const frameSource = options.frameSource || new StudioNativeExportFrameSource(movie, options);
		const ownsFrameSource = !options.frameSource;
		try {
			let audioBufferShim = null;
			if (includeAudio) {
				options.onStatus?.('Mixing imported Studio soundtrack...');
				audioBufferShim = options.audioBufferShim || await audioFor(movie, exportPlan, options);
			} else {
				options.onStatus?.(silentAudioFallback
					? 'AAC audio encoding is unavailable in this browser — exporting an MP4 without an audio track.'
					: 'Preparing a silent export (no audio track)...');
			}
			options.onStatus?.('Encoding native Studio frames with Animator...');
			const result = await AnimatorBrowserWorkerSession.render({
				audioBufferShim,
				includeAudio,
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
			return { ...result, capabilities, silentAudioFallback, includeAudio, download, plan: exportPlan,
				canonicalMovie: structuredClone(movie), adapterReport: structuredClone(projection.report),
				manifest: yesodCreateRenderManifest(movie, { id: 'awtsmoos-studio-native-composite' }, profile) };
		} finally {
			if (ownsFrameSource) frameSource.dispose?.();
		}
	}
}

/**
 * Studio's own export capability policy, built on the Animator's truthful
 * inspect() report. Every rendering vessel is required except AAC audio
 * encoding: when AAC alone is missing (common on Linux Chromium), export
 * proceeds without an audio track instead of vetoing the whole MP4.
 * The missing list names only real capabilities — the report's synthetic
 * aggregate field is never treated as a capability of its own.
 */
const REQUIRED_STUDIO_EXPORT_CAPABILITIES = Object.freeze([
	'worker', 'offscreenCanvas', 'videoEncoder', 'offlineAudio', 'audioDecode', 'h264'
]);

async function inspectStudioExportCapabilities(options) {
	const report = await AnimatorBrowserExportCapabilities.inspect();
	const missing = REQUIRED_STUDIO_EXPORT_CAPABILITIES.filter(name => report[name] !== true);
	if (missing.length) {
		throw new Error(`Browser MP4 export is unavailable: ${missing.join(', ')}`);
	}
	if (report.aac !== true) {
		options.onStatus?.('AAC audio encoding is unavailable in this browser — exporting an MP4 without an audio track.');
	}
	return report;
}

async function audioFor(movie, plan, options) {
	const seconds = plan.duration / 1000;
	return renderStudioExportAudio(movie, options.audioAssetStore || new StudioAudioAssetStore(), seconds, options);
}
function finiteDuration(requested, fallback) {
	const duration = Number(requested ?? fallback);
	if (!Number.isFinite(duration) || duration <= 0) throw new Error('Studio export duration must be positive.');
	return Math.min(Math.round(duration), Math.round(Number(fallback)));
}
