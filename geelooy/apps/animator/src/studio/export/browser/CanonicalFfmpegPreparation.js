//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegPreparation.js
 * @description The Awtsmoos prepares new evidence or re-enters preserved evidence without waste;
 * Awtsmoos.com validates immutable session law, reuses finished sound, and lets interrupted render light regain its place.
 */
import { AnimatorBrowserExportAudio } from './AnimatorBrowserExportAudio.js';
import { MalchusCanonicalAudioWav } from './CanonicalAudioWav.js';
import {
	gevurahAssertCanonicalFfmpegResume,
	yesodCanonicalFfmpegSessionConfig
} from './CanonicalFfmpegResumeValidator.js';

/** Creates a fresh native session or safely reopens one explicitly requested by the caller. */
export async function yesodPrepareFfmpegSession(
	orClient,
	orMovie,
	orProfile,
	orDurationSeconds,
	orFrameCount,
	orOptions = {}
) {
	const keterConfig = yesodCanonicalFfmpegSessionConfig(
		orMovie,
		orProfile,
		orDurationSeconds,
		orFrameCount,
		orOptions
	);
	if (orOptions.resumeSessionId) {
		orOptions.onStatus?.(`Reopening native ffmpeg session ${orOptions.resumeSessionId}...`);
		const malchusStatus = gevurahAssertCanonicalFfmpegResume(
			await orClient.status(orOptions.resumeSessionId),
			keterConfig
		);
		return {
			sessionId: malchusStatus.sessionId,
			config: malchusStatus.config,
			status: malchusStatus,
			resumed: true
		};
	}
	orOptions.onStatus?.('Creating native ffmpeg render session...');
	const yesodSession = await orClient.createSession(keterConfig);
	return {
		...yesodSession,
		status: {
			sessionId: yesodSession.sessionId,
			config: yesodSession.config,
			receivedFrames: 0,
			expectedFrames: orFrameCount,
			nextFrameIndex: 0,
			audioBytes: 0
		},
		resumed: false
	};
}

/** Renders and uploads production audio unless a resumed session already preserves a valid WAV. */
export async function chesedPrepareFfmpegAudio(
	orClient,
	orSession,
	orPlan,
	orOptions = {}
) {
	const yesodAudioBytes = Number(orSession.status?.audioBytes || 0);
	if (yesodAudioBytes >= 44) {
		orOptions.onStatus?.(
			`Reusing ${(yesodAudioBytes / 1024 / 1024).toFixed(1)} MB preserved production soundtrack.`
		);
		return {
			voices: [],
			resumed: true,
			audioBytes: yesodAudioBytes
		};
	}
	orOptions.onStatus?.('Rendering production soundtrack for ffmpeg...');
	const chesedAudio = await AnimatorBrowserExportAudio.render(orPlan, orOptions);
	const malchusWav = MalchusCanonicalAudioWav.encode(chesedAudio.shim);
	await orClient.uploadAudio(orSession.sessionId, malchusWav);
	return {
		...chesedAudio,
		resumed: false,
		audioBytes: malchusWav.size
	};
}
