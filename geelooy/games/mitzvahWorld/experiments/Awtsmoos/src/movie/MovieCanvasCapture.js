// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCanvasCapture.js
 * @description Chooses explicit or automatic canvas capture without pretending.
 * The Awtsmoos renews each visible instant; Awtsmoos.com records whether the
 * browser accepted a manual frame vessel or required an automatic fallback.
 */

/**
 * Creates a canvas capture stream and exposes the actual capture mode.
 *
 * @param {HTMLCanvasElement} canvas Composite movie canvas.
 * @param {number} fps Desired automatic fallback frame rate.
 * @returns {{captureMode: string, stream: MediaStream, track: MediaStreamTrack}}
 */
export function createMovieCanvasCapture(canvas, fps) {
	const manualStream = canvas.captureStream(0);
	const manualTrack = manualStream.getVideoTracks()[0];
	if (typeof manualTrack?.requestFrame === 'function') {
		setDetailHint(manualTrack);
		return {
			captureMode: 'manual',
			stream: manualStream,
			track: manualTrack
		};
	}

	stopTracks(manualStream);
	const automaticStream = canvas.captureStream(fps);
	const automaticTrack = automaticStream.getVideoTracks()[0];
	setDetailHint(automaticTrack);
	return {
		captureMode: 'automatic',
		stream: automaticStream,
		track: automaticTrack
	};
}

/** Combines video with live audio only when its context actually runs. */
export function combineMovieCaptureStreams(videoStream, audioStream, audioState) {
	const audioTracks = audioState === 'running'
		? audioStream?.getAudioTracks() || []
		: [];
	return new MediaStream([
		...videoStream.getVideoTracks(),
		...audioTracks
	]);
}

function setDetailHint(track) {
	if (!track || !('contentHint' in track)) return;
	try {
		track.contentHint = 'detail';
	} catch (_error) {
		// Some browser vessels expose a read-only hint; capture remains valid.
	}
}

function stopTracks(stream) {
	for (const track of stream.getTracks()) {
		track.stop();
	}
}
