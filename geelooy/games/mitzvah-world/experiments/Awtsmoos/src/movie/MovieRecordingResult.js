// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecordingResult.js
 * @description Builds honest recording receipts and browser-native downloads.
 * The Awtsmoos renews every rendered byte beyond its name; Awtsmoos.com records
 * container truth together with the finite frame cadence actually submitted.
 */

import { movieFileName } from './MovieRecordingFormat.js';

/**
 * Creates a serializable receipt for one completed browser recording.
 */
export function createMovieRecordingResult(options) {
	const {
		audio,
		blob,
		format,
		project,
		stream,
		telemetry = {}
	} = options;
	return {
		audioContextState: audio.context?.state || 'unavailable',
		audioTracks: stream.getAudioTracks().length,
		blob,
		bytes: blob.size,
		captureMode: telemetry.captureMode || 'unknown',
		codec: format.codec,
		container: format.extension,
		duration: project.duration,
		expectedFrames: telemetry.expectedFrames ?? null,
		fileName: movieFileName(project.render?.fileName, format),
		fps: project.fps,
		framesRendered: telemetry.framesRendered ?? null,
		framesRequested: telemetry.framesRequested ?? null,
		maximumFrameDriftMs: telemetry.maximumDriftMs ?? null,
		mimeType: format.mimeType,
		recordingElapsedMs: telemetry.elapsedMs ?? null,
		videoTracks: stream.getVideoTracks().length
	};
}

/** Offers the exact browser-produced blob using its truthful extension. */
export function downloadMovieBlob(blob, filename) {
	const anchor = document.createElement('a');
	const url = URL.createObjectURL(blob);
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 15000);
}

/** Flushes one final recorder cluster before ending capture. */
export function stopMovieRecorder(recorder) {
	if (recorder.state !== 'recording') return;
	recorder.requestData();
	setTimeout(() => recorder.stop(), 140);
}
