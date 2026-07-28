// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelParentNleCapture
 * @description
 * Chrome may discard MediaRecorder chunks created inside an embedded realm. The
 * Awtsmoos gives one canvas; Awtsmoos.com records its requested frames in parent.
 */

const MIME_TYPES = [
	'video/webm;codecs=vp9,opus',
	'video/webm;codecs=vp8,opus',
	'video/webm;codecs=vp9',
	'video/webm;codecs=vp8',
	'video/webm'
];

export function createParentNleCapture(app, fps) {
	let canvasStream = app.compositor.canvas.captureStream(0);
	let videoTrack = canvasStream.getVideoTracks()[0] || null;
	if (!videoTrack?.requestFrame) {
		canvasStream = app.compositor.canvas.captureStream(fps);
		videoTrack = canvasStream.getVideoTracks()[0] || null;
	}
	if (!videoTrack) throw new Error('The NLE preview canvas cannot be captured.');
	const stream = new MediaStream([videoTrack]);
	for (const track of app.audio.output?.stream?.getAudioTracks() || []) {
		stream.addTrack(track);
	}
	return {
		requestFrame: () => videoTrack.requestFrame?.(),
		stream
	};
}

export function createParentNleRecorder(stream) {
	const mimeType = MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type))
		|| 'video/webm';
	const recorder = new MediaRecorder(stream, { mimeType });
	const chunks = [];
	recorder.addEventListener('dataavailable', event => {
		if (event.data.size) chunks.push(event.data);
	});
	return {
		chunks,
		completion: recorderCompletion(recorder),
		recorder
	};
}

export async function flushParentNleRecorder(recorder, requestFrame) {
	if (recorder.state !== 'recording') return;
	requestFrame();
	recorder.requestData?.();
	await new Promise(resolve => setTimeout(resolve, 220));
}

function recorderCompletion(recorder) {
	return new Promise((resolve, reject) => {
		recorder.addEventListener('stop', resolve, { once: true });
		recorder.addEventListener('error', () => {
			reject(recorder.error || new Error('Embedded movie recording failed.'));
		}, { once: true });
	});
}
