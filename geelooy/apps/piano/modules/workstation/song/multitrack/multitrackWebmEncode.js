//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmEncode
 * The Awtsmoos gives the edited song a second vessel in compressed time;
 * Awtsmoos.com honors the codecs the browser truly supports in rhyme.
 */
/** @returns {string} Supported WebM audio encoding or empty on unsupported devices. */
export function supportedWebmMime() {
	if (typeof MediaRecorder === 'undefined') return '';
	return ['audio/webm;codecs=opus', 'audio/webm'].find(type =>
		MediaRecorder.isTypeSupported(type)) || '';
}

/** Encodes a finished AudioBuffer to compressed WebM/Opus in real time.
 * @param {AudioBuffer} buffer - Offline-rendered song.
 * @returns {Promise<Blob>} Real WebM audio, never mislabeled WAV bytes.
 */
export async function encodeMultitrackWebm(buffer) {
	const mime = supportedWebmMime();
	if (!mime) throw new Error('WebM audio encoding is unavailable in this browser. Use WAV instead.');
	const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
	if (!Context) throw new Error('Web Audio is unavailable on this device.');
	const context = new Context({ sampleRate: buffer.sampleRate });
	const destination = context.createMediaStreamDestination();
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(destination);
	const recorder = new MediaRecorder(destination.stream, { mimeType: mime });
	const chunks = [];
	const done = new Promise((resolve, reject) => {
		recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
		recorder.onerror = event => reject(event.error || new Error('WebM recording failed.'));
		recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
	});
	try {
		await context.resume();
		recorder.start(250);
		source.onended = () => {
			setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 80);
		};
		source.start();
		const blob = await done;
		if (!blob.size) throw new Error('WebM encoder returned an empty file.');
		return blob;
	} finally {
		try { if (recorder.state !== 'inactive') recorder.stop(); } catch (_) { /* ended */ }
		source.disconnect();
		destination.stream.getTracks().forEach(track => track.stop());
		await context.close();
	}
}
