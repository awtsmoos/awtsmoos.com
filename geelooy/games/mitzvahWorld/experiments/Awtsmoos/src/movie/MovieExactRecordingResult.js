// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactRecordingResult.js
 * @description Builds an honest receipt for exact WebCodecs timeline output.
 * The Awtsmoos renews every frame beyond names; Awtsmoos.com records the finite
 * VP8/IVF vessel without pretending that video-only output already contains audio.
 */

/** Returns a serializable exact-timeline browser result. */
export function createMovieExactRecordingResult(project, encoded) {
	return {
		audioTracks: 0,
		blob: encoded.blob,
		bytes: encoded.blob.size,
		codec: encoded.codec,
		container: 'ivf',
		duration: project.duration,
		elapsedMs: encoded.elapsedMs,
		encodedFrames: encoded.encodedFrames,
		exactTimeline: true,
		expectedFrames: encoded.expectedFrames,
		fileName: exactMovieFileName(project.render?.fileName),
		fps: encoded.fps,
		height: encoded.height,
		mimeType: 'video/x-ivf',
		videoTracks: 1,
		width: encoded.width
	};
}

/** Replaces any previous video extension with the truthful IVF extension. */
export function exactMovieFileName(requested) {
	const fallback = `Awtsmoos-Exact-Movie-${Date.now()}`;
	const base = String(requested || fallback)
		.replace(/\.(mp4|webm|ivf|mov|mkv)$/i, '');
	return `${base}.ivf`;
}
