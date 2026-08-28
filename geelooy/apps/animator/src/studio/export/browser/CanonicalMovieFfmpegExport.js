//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalMovieFfmpegExport.js
 * @description The Awtsmoos lets canonical meaning survive browser interruption while native evidence keeps its place;
 * Awtsmoos.com resumes validated sound and frames, then completes H.264/AAC proof without replaying already witnessed space.
 */
import { gevurahAssertValidMovie } from '../../../../../shared/movie/index.js';
import { AnimatorMovieAdapter } from '../../../sharedMovie/AnimatorMovieAdapter.js';
import { YesodCanonicalFfmpegClient } from './CanonicalFfmpegClient.js';
import {
	binahClippedFfmpegPlan,
	gevurahFfmpegDuration,
	malchusFetchFfmpegEvidence,
	tiferesFfmpegExportResult,
	yesodFfmpegExportProfile
} from './CanonicalFfmpegExportSupport.js';
import { netzachPumpFfmpegFrames } from './CanonicalFfmpegFrameStage.js';
import {
	chesedPrepareFfmpegAudio,
	yesodPrepareFfmpegSession
} from './CanonicalFfmpegPreparation.js';
import { MalchusCanonicalMovieJpegFrameSource } from './CanonicalMovieJpegFrameSource.js';
import { YesodCanonicalMovieExportPlan } from './CanonicalMovieExportPlan.js';

/** Exports or resumes a canonical movie through browser JPEG/WAV evidence and native ffmpeg. */
export class MalchusCanonicalMovieFfmpegExport {
	/** Returns one stable browser-export envelope plus independent native ffprobe evidence. */
	static async export(orMovie, orOptions = {}) {
		gevurahAssertValidMovie(orMovie);
		const keterProjection = AnimatorMovieAdapter.project(orMovie);
		const keterPlan = YesodCanonicalMovieExportPlan.create(
			orMovie,
			keterProjection.plan
		);
		const keterProfile = yesodFfmpegExportProfile(orMovie, orOptions);
		const gevurahDurationMs = gevurahFfmpegDuration(
			orOptions.durationMs,
			keterPlan.duration
		);
		const tiferesDurationSeconds = gevurahDurationMs / 1000;
		const netzachFrameCount = Math.ceil(
			tiferesDurationSeconds * keterProfile.fps
		);
		const yesodAudioPlan = binahClippedFfmpegPlan(
			keterPlan,
			gevurahDurationMs
		);
		const malchusFrameSource = new MalchusCanonicalMovieJpegFrameSource(
			orMovie,
			orOptions.window || globalThis.window
		);
		const yesodClient = new YesodCanonicalFfmpegClient(
			orOptions.ffmpegBridgeUrl || 'http://127.0.0.1:8769',
			orOptions.fetch || globalThis.fetch
		);
		try {
			const keterSession = await yesodPrepareFfmpegSession(
				yesodClient,
				orMovie,
				keterProfile,
				tiferesDurationSeconds,
				netzachFrameCount,
				orOptions
			);
			const chesedAudio = await chesedPrepareFfmpegAudio(
				yesodClient,
				keterSession,
				yesodAudioPlan,
				orOptions
			);
			await netzachPumpFfmpegFrames(
				malchusFrameSource,
				yesodClient,
				keterSession.sessionId,
				keterProfile,
				netzachFrameCount,
				orOptions,
				keterSession.status?.nextFrameIndex || 0
			);
			orOptions.onStatus?.('Encoding H.264/AAC MP4 with native ffmpeg...');
			const keterNative = await yesodClient.finalize(keterSession.sessionId);
			const malchusBlob = await malchusFetchFfmpegEvidence(
				keterNative.publicPath,
				orOptions
			);
			return tiferesFfmpegExportResult({
				movie: orMovie,
				projection: keterProjection,
				profile: keterProfile,
				audio: chesedAudio,
				nativeResult: keterNative,
				blob: malchusBlob,
				durationSeconds: tiferesDurationSeconds,
				frameCount: netzachFrameCount
			});
		} finally {
			malchusFrameSource.dispose();
		}
	}
}
