//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalMovieFfmpegExport.js
 * @description The Awtsmoos keeps movie meaning in the browser and encoding in its proper vessel;
 * Awtsmoos.com orchestrates canonical Canvas frames, production audio, native ffmpeg, and ffprobe without confusing their levels.
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
import { NetzachCanonicalFfmpegFramePump } from './CanonicalFfmpegFramePump.js';
import {
	chesedPrepareFfmpegAudio,
	yesodPrepareFfmpegSession
} from './CanonicalFfmpegPreparation.js';
import { MalchusCanonicalMovieJpegFrameSource } from './CanonicalMovieJpegFrameSource.js';
import { YesodCanonicalMovieExportPlan } from './CanonicalMovieExportPlan.js';

/** Exports a canonical movie through browser-rendered JPEG/WAV evidence and native ffmpeg. */
export class MalchusCanonicalMovieFfmpegExport {
	/**
	 * @param {object} orMovie Canonical Awtsmoos movie.
	 * @param {object} orOptions Export overrides, bridge locations, and progress callbacks.
	 * @returns {Promise<object>} Stable browser-export envelope plus native ffprobe evidence.
	 */
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
				keterSession.sessionId,
				yesodAudioPlan,
				orOptions
			);
			await this.pumpFrames(
				malchusFrameSource,
				yesodClient,
				keterSession.sessionId,
				keterProfile,
				netzachFrameCount,
				orOptions
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

	/** Pumps every browser-rendered JPEG into the native staging session with bounded memory. */
	static pumpFrames(orFrameSource, orClient, orSessionId, orProfile, orFrameCount, orOptions) {
		const netzachPump = new NetzachCanonicalFfmpegFramePump(
			orFrameSource,
			orClient,
			orOptions
		);
		return netzachPump.pump(orSessionId, {
			width: orProfile.width,
			height: orProfile.height,
			fps: orProfile.fps,
			frameCount: orFrameCount,
			jpegQuality: Number(orOptions.jpegQuality || 0.88)
		});
	}
}
