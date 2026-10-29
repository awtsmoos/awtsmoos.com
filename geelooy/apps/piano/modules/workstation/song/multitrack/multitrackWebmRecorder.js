//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmRecorder
 * The Awtsmoos hears the sound when modern code cannot yet draw near;
 * Awtsmoos.com retains this native fallback so every device can hear.
 */

/** @returns {string} Audio-only WebM MIME available to MediaRecorder. */
export function supportedWebmMime() {
	if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
	return ['audio/webm;codecs=opus', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type)) || '';
}

/** @param {MediaRecorder} recorder - Native recording session. @returns {Promise<Blob>} Complete WebM. */
function captureRecording(recorder) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
		recorder.onerror = event => reject(event.error || new Error('WebM recording failed.'));
		recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
	});
}

/** @param {Blob} blob - Encoded file. @returns {Promise<boolean>} True for EBML header. */
export async function hasWebmHeader(blob) {
	const magic = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
	return magic[0] === 0x1a && magic[1] === 0x45 && magic[2] === 0xdf && magic[3] === 0xa3;
}

/** Retains the original real-time browser recording fallback.
 * @param {AudioBuffer} buffer - Complete mixed sound.
 * @param {Function} onProgress - Fraction of audio played into the recorder.
 * @returns {Promise<Blob>} WebM/Opus audio bytes.
 */
export async function encodeWebmWithRecorder(buffer, onProgress = () => {}) {
	const mime = supportedWebmMime();
	if (!mime) throw new Error('WebM audio is unavailable. Download WAV instead.');
	const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
	if (!Context) throw new Error('Web Audio recording is unsupported.');
	const context = new Context({ sampleRate: buffer.sampleRate });
	let source;
	let recorder;
	let interval;
	let watchdog;
	let stopDelay;
	let destination;
	try {
		destination = context.createMediaStreamDestination();
		source = context.createBufferSource();
		source.buffer = buffer;
		source.connect(destination);
		recorder = new MediaRecorder(destination.stream, { mimeType: mime, audioBitsPerSecond: 128000 });
		const recording = captureRecording(recorder);
		await context.resume();
		recorder.start(200);
		const startedAt = context.currentTime + .06;
		source.onended = () => {
			stopDelay = setTimeout(() => {
				if (recorder.state !== 'inactive') recorder.stop();
			}, 250);
		};
		source.start(startedAt);
		interval = setInterval(() => {
			onProgress(Math.min(.99, Math.max(0, (context.currentTime - startedAt) / buffer.duration)));
		}, 150);
		watchdog = setTimeout(() => {
			if (recorder.state !== 'inactive') recorder.stop();
		}, Math.ceil((buffer.duration + 8) * 1000));
		const blob = await recording;
		if (blob.size < 64 || !(await hasWebmHeader(blob))) {
			throw new Error('Browser produced invalid WebM audio. Download WAV instead.');
		}
		onProgress(1);
		return blob;
	} finally {
		clearInterval(interval);
		clearTimeout(watchdog);
		clearTimeout(stopDelay);
		try { source?.stop(); } catch (_) { /* Finished audio is silent now. */ }
		try { source?.disconnect(); } catch (_) { /* Already detached. */ }
		try { if (recorder?.state !== 'inactive') recorder?.stop(); } catch (_) { /* Already stopped. */ }
		destination?.stream?.getTracks().forEach(track => track.stop());
		await context.close();
	}
}
