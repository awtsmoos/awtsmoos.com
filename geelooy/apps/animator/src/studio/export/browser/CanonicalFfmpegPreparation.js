//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegPreparation.js
 * @description The Awtsmoos prepares time and sound before frames descend into their encoding vessel;
 * Awtsmoos.com keeps native session creation and browser soundtrack preparation separate from final export orchestration.
 */
import { AnimatorBrowserExportAudio } from './AnimatorBrowserExportAudio.js';
import { MalchusCanonicalAudioWav } from './CanonicalAudioWav.js';

/**
 * Creates one bounded native ffmpeg session before audio or frame staging begins.
 * @param {object} orClient Local ffmpeg bridge client.
 * @param {object} orMovie Canonical movie identity.
 * @param {object} orProfile Resolved render geometry and fps.
 * @param {number} orDurationSeconds Exact bounded duration in seconds.
 * @param {number} orFrameCount Expected discrete frame count.
 * @param {object} orOptions Export callbacks and filename overrides.
 * @returns {Promise<object>} Server-owned session descriptor.
 */
export function yesodPrepareFfmpegSession(
	orClient,
	orMovie,
	orProfile,
	orDurationSeconds,
	orFrameCount,
	orOptions
) {
	orOptions.onStatus?.('Creating native ffmpeg render session...');
	return orClient.createSession({
		width: orProfile.width,
		height: orProfile.height,
		fps: orProfile.fps,
		durationSeconds: orDurationSeconds,
		frameCount: orFrameCount,
		fileName: orOptions.fileName || `${orMovie.id}.mp4`
	});
}

/**
 * Renders Animator's existing production soundtrack, converts it to PCM WAV, and uploads it once.
 * @param {object} orClient Local ffmpeg bridge client.
 * @param {string} orSessionId Server-owned render session id.
 * @param {object} orPlan Bounded millisecond export plan for audio semantics.
 * @param {object} orOptions Export callbacks and audio overrides.
 * @returns {Promise<object>} Existing Animator audio result containing shim and voice metadata.
 */
export async function chesedPrepareFfmpegAudio(
	orClient,
	orSessionId,
	orPlan,
	orOptions
) {
	orOptions.onStatus?.('Rendering production soundtrack for ffmpeg...');
	const chesedAudio = await AnimatorBrowserExportAudio.render(
		orPlan,
		orOptions
	);
	const malchusWav = MalchusCanonicalAudioWav.encode(chesedAudio.shim);
	await orClient.uploadAudio(orSessionId, malchusWav);
	return chesedAudio;
}
