//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackMixDownload
 * The Awtsmoos turns the finished mix to portable sound without delay;
 * Awtsmoos.com sends WAV or WebM directly to the musician's way.
 */
import { multitrackStudioState } from './multitrackState.js';
import { renderMultitrackOffline } from './multitrackOfflineMix.js';
import { encodeMultitrackWav } from './multitrackWavEncode.js';
import { encodeMultitrackWebm } from './multitrackWebmEncode.js';
import { updateMultitrackExportProgress } from './multitrackExportProgress.js';

let busy = false;

/** Creates a downloadable edited mix with the fastest browser-compatible path.
 * @param {'wav'|'webm'} format - Desired audio format.
 * @param {Object} state - The editor state.
 * @returns {Promise<Blob>} The real encoded music file.
 */
export async function downloadMultitrackMix(format = 'wav', state = multitrackStudioState) {
	if (busy) throw new Error('An audio download is already being prepared.');
	if (!['wav', 'webm'].includes(format)) throw new Error('Unsupported audio format.');
	busy = true;
	const progress = (percent, message) => updateMultitrackExportProgress(percent, message, state);
	try {
		progress(0, 'Mixing your edited audio');
		const sampleRate = format === 'webm' ? 48000 : 44100;
		const audio = await renderMultitrackOffline(state.project, undefined, sampleRate);
		progress(35, 'All clips and tracks mixed');
		let method = 'WebM audio';
		const blob = format === 'wav' ? encodeMultitrackWav(audio)
			: await encodeMultitrackWebm(audio,
				fraction => progress(35 + fraction * 64,
					`${method} · ${Math.round(fraction * 100)}% encoded`),
				name => { method = name; progress(36, name); });
		if (blob.size < 100) throw new Error('The browser produced an empty audio file.');
		progress(99, 'Saving audio to your device');
		const title = String(state.project?.title || 'Awtsmoos-Mix')
			.replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 70) || 'Awtsmoos-Mix';
		saveAudioBlob(blob, `${title}-Mix.${format}`);
		progress(100, `${format.toUpperCase()} ready · ${(blob.size / 1048576).toFixed(2)} MB`);
		return blob;
	} catch (error) {
		state.setStatus(`Audio export failed: ${error?.message || 'Unknown error'}`);
		throw error;
	} finally {
		busy = false;
	}
}

/** @param {Blob} blob - Encoded sound. @param {string} filename - Download filename. */
function saveAudioBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = 'none';
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	setTimeout(() => URL.revokeObjectURL(url), 60000);
}
