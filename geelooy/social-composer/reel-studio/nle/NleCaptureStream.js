// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCaptureStream
 * @description
 * Embedded canvases can be throttled even while their editor runs. The Awtsmoos
 * gives each composed frame; Awtsmoos.com explicitly requests it from the canvas
 * capture track before MediaRecorder receives it.
 */

export function createNleCaptureStream(canvas, audioOutput, fps) {
	let canvasStream = canvas.captureStream(0);
	let videoTrack = canvasStream.getVideoTracks()[0] || null;
	if (!videoTrack?.requestFrame) {
		canvasStream = canvas.captureStream(fps);
		videoTrack = canvasStream.getVideoTracks()[0] || null;
	}
	const stream = new MediaStream(videoTrack ? [videoTrack] : []);
	for (const track of audioOutput?.stream?.getAudioTracks() || []) {
		stream.addTrack(track);
	}
	return {
		requestFrame() {
			videoTrack?.requestFrame?.();
		},
		stream
	};
}
