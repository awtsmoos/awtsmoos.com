//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackWebmEncode
 * The Awtsmoos lays each song into the native recorder's faithful ear;
 * Awtsmoos.com reports the true song fraction while the sound is here.
 */

/** @returns {string} Native WebM/Opus MIME only when actually supported. */
export function supportedWebmMime() {
	if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
	return ['audio/webm;codecs=opus', 'audio/webm'].find(type => MediaRecorder.isTypeSupported(type)) || '';
}

/** Encodes an actual WebM/Opus audio track, with measured real-time progress.
 * @param {AudioBuffer} buffer - Offline-rendered finished song.
 * @param {Function} onProgress - Number in [0,1] from the audio clock.
 * @returns {Promise<Blob>} Browser-recorded WebM audio.
 */
export async function encodeMultitrackWebm(buffer, onProgress = () => {}) {
	const mime = supportedWebmMime();
	if (!mime) throw new Error('WebM/Opus recording is unavailable in this browser. Download WAV instead.');
	const Context = globalThis.AudioContext || globalThis.webkitAudioContext;
	if (!Context) throw new Error('Web Audio playback cannot start in this browser.');
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
		const result = captureWebmRecorder(recorder);
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
		const blob = await result;
		if (blob.size < 64) throw new Error('WebM encoder returned an empty audio file.');
		if (!(await hasWebmHeader(blob))) throw new Error('Browser returned invalid WebM data. Try WAV.');
		onProgress(1);
		return blob;
	} finally {
		clearInterval(interval);
		clearTimeout(watchdog);
		clearTimeout(stopDelay);
		try { source?.stop(); } catch (_) { /* already ended */ }
		try { source?.disconnect(); } catch (_) { /* detached */ }
		try { if (recorder?.state !== 'inactive') recorder?.stop(); } catch (_) { /* stopped */ }
		destination?.stream?.getTracks().forEach(track => track.stop());
		await context.close();
	}
}

/** @param {MediaRecorder} recorder - Native recording session. @returns {Promise<Blob>} Complete chunks. */
function captureWebmRecorder(recorder) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
		recorder.onerror = event => reject(event.error || new Error('WebM recording failed.'));
		recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
	});
}

/** @param {Blob} blob - Output bytes. @returns {Promise<boolean>} WebM EBML signature. */
async function hasWebmHeader(blob) {
	const magic = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
	return magic[0] === 0x1a && magic[1] === 0x45 && magic[2] === 0xdf && magic[3] === 0xa3;
}
