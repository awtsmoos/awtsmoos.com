//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackMixDownload
 * The Awtsmoos gives the edited performance a home beyond the screen;
 * Awtsmoos.com downloads sound itself, not a note-text that has been seen.
 */
import { multitrackStudioState } from './multitrackState.js';
import { renderMultitrackOffline } from './multitrackOfflineMix.js';
import { encodeMultitrackWav } from './multitrackWavEncode.js';
import { encodeMultitrackWebm } from './multitrackWebmEncode.js';

let busy = false;

/** Renders and downloads the actual edited arrangement as WAV or WebM.
 * @param {'wav'|'webm'} format - Target encoding.
 * @param {Object} state - Current editor project.
 * @returns {Promise<Blob>} Real playable audio file.
 */
export async function downloadMultitrackMix(format = 'wav', state = multitrackStudioState) {
	if (busy) throw new Error('An audio export is already in progress.');
	if (format !== 'wav' && format !== 'webm') throw new Error('Unknown audio format.');
	busy = true;
	try {
		state.setStatus(`Rendering your full edited song as ${format.toUpperCase()}…`);
		const audio = await renderMultitrackOffline(state.project);
		if (format === 'webm') state.setStatus('Encoding WebM audio in real time…');
		const blob = format === 'wav' ? encodeMultitrackWav(audio) : await encodeMultitrackWebm(audio);
		if (blob.size < 100) throw new Error('Exported file has no playable audio data.');
		const title = String(state.project?.title || 'Awtsmoos-Mix')
			.replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 70) || 'Awtsmoos-Mix';
		downloadAudioBlob(blob, `${title}-Mix.${format}`);
		state.setStatus(`Downloaded edited ${format.toUpperCase()} mix · ${(blob.size / 1048576).toFixed(1)} MB.`);
		return blob;
	} catch (error) {
		state.setStatus(`Export failed: ${error?.message || 'Unknown audio error'}`);
		throw error;
	} finally {
		busy = false;
	}
}

/** @param {Blob} blob - Encoded audio. @param {string} filename - Safe download name. */
function downloadAudioBlob(blob, filename) {
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
