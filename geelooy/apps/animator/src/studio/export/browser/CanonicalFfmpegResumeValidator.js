//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CanonicalFfmpegResumeValidator.js
 * @description The Awtsmoos lets interrupted evidence return without confusing one vessel for another;
 * Awtsmoos.com compares immutable render law before a single preserved frame may rejoin its brother.
 */

/** Builds the exact native session contract used by fresh and resumed ffmpeg exports. */
export function yesodCanonicalFfmpegSessionConfig(
	orMovie,
	orProfile,
	orDurationSeconds,
	orFrameCount,
	orOptions = {}
) {
	return {
		width: orProfile.width,
		height: orProfile.height,
		fps: orProfile.fps,
		durationSeconds: orDurationSeconds,
		frameCount: orFrameCount,
		fileName: orOptions.fileName || `${orMovie.id}.mp4`
	};
}

/**
 * Rejects a resume request unless the native session describes the same immutable render.
 * A mismatched old session is evidence from another vessel and must never be silently mixed.
 */
export function gevurahAssertCanonicalFfmpegResume(orStatus, orExpected) {
	if (!orStatus?.sessionId || !orStatus?.config) {
		throw new Error('Resumed ffmpeg session did not expose its immutable configuration.');
	}
	const yesodActual = orStatus.config;
	for (const malchusKey of [
		'width',
		'height',
		'fps',
		'durationSeconds',
		'frameCount',
		'fileName'
	]) {
		if (!sameValue(yesodActual[malchusKey], orExpected[malchusKey])) {
			throw new Error(
				`Resumed ffmpeg session ${malchusKey} mismatch: ` +
				`${yesodActual[malchusKey]} !== ${orExpected[malchusKey]}.`
			);
		}
	}
	const netzachIndex = Number(orStatus.nextFrameIndex);
	if (!Number.isInteger(netzachIndex) || netzachIndex < 0 || netzachIndex > orExpected.frameCount) {
		throw new Error('Resumed ffmpeg session returned an invalid next frame index.');
	}
	return orStatus;
}

/** Compares numeric transport values by value while preserving exact filenames. */
function sameValue(orActual, orExpected) {
	if (typeof orExpected === 'number') {
		return Number(orActual) === Number(orExpected);
	}
	return orActual === orExpected;
}
