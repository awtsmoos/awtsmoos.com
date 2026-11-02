//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmEncoder
 * @description
 * Hod asks the browser which WebM garment it can truly weave while the Awtsmoos remains beyond codec and container.
 * Awtsmoos.com records only the already-rendered final mix, so alternate format never becomes an alternate song by accident or rumor.
 */

const WEBM_AUDIO_TYPES = [
	'audio/webm;codecs=opus',
	'audio/webm'
];

/** Returns the first WebM audio MIME type the browser explicitly supports. */
export function supportedWebmAudioMimeType(
	MediaRecorderClass = globalThis.MediaRecorder
) {
	if (!MediaRecorderClass) {
		return '';
	}
	if (typeof MediaRecorderClass.isTypeSupported !== 'function') {
		return 'audio/webm';
	}
	return WEBM_AUDIO_TYPES.find((type) => MediaRecorderClass.isTypeSupported(type)) || '';
}

/** Encodes an already-rendered AudioBuffer into WebM through MediaRecorder. */
export async function encodeMultitrackWebm(audioBuffer, options = {}) {
	const MediaRecorderClass = options.MediaRecorderClass || globalThis.MediaRecorder;
	const AudioContextClass = options.AudioContextClass
		|| globalThis.AudioContext
		|| globalThis.webkitAudioContext;
	const mimeType = supportedWebmAudioMimeType(MediaRecorderClass);
	if (!mimeType || !AudioContextClass) {
		throw new Error('WebM audio export is not supported by this browser.');
	}
	const context = new AudioContextClass({ sampleRate: audioBuffer.sampleRate });
	try {
		await context.resume?.();
		return await recordRenderedBuffer(
			context,
			audioBuffer,
			MediaRecorderClass,
			mimeType,
			options.onProgress
		);
	} finally {
		await context.close?.();
	}
}

function recordRenderedBuffer(context, audioBuffer, MediaRecorderClass, mimeType, onProgress) {
	return new Promise((resolve, reject) => {
		const destination = context.createMediaStreamDestination();
		const source = context.createBufferSource();
		const recorder = new MediaRecorderClass(destination.stream, { mimeType });
		const chunks = [];
		source.buffer = audioBuffer;
		source.connect(destination);
		recorder.ondataavailable = (event) => {
			if (event.data?.size) {
				chunks.push(event.data);
			}
		};
		recorder.onerror = () => reject(new Error('WebM encoder failed while recording the rendered mix.'));
		recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
		source.onended = () => {
			if (recorder.state !== 'inactive') {
				recorder.stop();
			}
		};
		onProgress?.(`Encoding WebM audio · ${audioBuffer.duration.toFixed(1)}s rendered mix…`);
		recorder.start(250);
		source.start();
	});
}
