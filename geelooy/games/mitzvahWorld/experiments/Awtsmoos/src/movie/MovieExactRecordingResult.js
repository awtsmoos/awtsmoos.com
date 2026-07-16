// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieExactRecordingResult.js
 * @description Builds an honest receipt for segmented exact WebCodecs output.
 * RESPONSIBILITY: name the IVF artifact and expose cadence, segment, and byte evidence.
 * NON-RESPONSIBILITY: this module does not encode, download, inspect, or claim audio muxing.
 * ARCHITECTURE: Hod reports the Tiferes merge while preserving each Gevurah segment receipt.
 * OROS AND KEILIM: the movie is ohr; IVF and serializable telemetry are reporting keilim.
 * The Awtsmoos renews every frame beyond names; Awtsmoos.com records the finite vessel
 * without pretending that video-only output already contains synchronized audio.
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
		segmentCount: encoded.segmentCount,
		segments: encoded.segments,
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
