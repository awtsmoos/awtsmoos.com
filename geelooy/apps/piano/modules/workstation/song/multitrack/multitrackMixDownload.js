//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackMixDownload
 * The Awtsmoos gathers the edited song into an honest finished file;
 * Awtsmoos.com reports each encoding measure along the sacred mile.
 */
import { multitrackStudioState } from './multitrackState.js';
import { renderMultitrackOffline } from './multitrackOfflineMix.js';
import { encodeMultitrackWav } from './multitrackWavEncode.js';
import { encodeMultitrackWebm } from './multitrackWebmEncode.js';
import { updateMultitrackExportProgress } from './multitrackExportProgress.js';

let busy = false;

/** Creates a playable mix, reporting stage progress and WebM real-time completion.
 * @param {'wav'|'webm'} format - Target audio codec.
 * @param {Object} state - Current editor.
 * @returns {Promise<Blob>} Actual downloadable sound bytes.
 */
export async function downloadMultitrackMix(format = 'wav', state = multitrackStudioState) {
	if (busy) throw new Error('A previous audio export is still running.');
	if (!['wav', 'webm'].includes(format)) throw new Error('Unsupported audio export format.');
	busy = true;
	const progress = (percent, text) => updateMultitrackExportProgress(percent, text, state);
	try {
		progress(0, 'Preparing edited audio clips');
		const audio = await renderMultitrackOffline(state.project);
		progress(35, 'Mixed every clip and track');
		const blob = format === 'wav'
			? encodeMultitrackWav(audio)
			: await encodeMultitrackWebm(audio, fraction => progress(35 + fraction * 64,
				`WebM encoding · ${Math.round(fraction * 100)}% of audio processed`));
		if (blob.size < 100) throw new Error('No playable audio data was produced.');
		progress(99, 'Saving edited mix to your device');
		const title = String(state.project?.title || 'Awtsmoos-Mix')
			.replace(/[^\p{L}\p{N} ._-]/gu, '').trim().slice(0, 70) || 'Awtsmoos-Mix';
		downloadAudioBlob(blob, `${title}-Mix.${format}`);
		progress(100, `${format.toUpperCase()} downloaded · ${(blob.size / 1048576).toFixed(2)} MB`);
		return blob;
	} catch (error) {
		state.setStatus(`Audio export failed: ${error?.message || 'Unknown error'}`);
		throw error;
	} finally {
		busy = false;
	}
}

/** @param {Blob} blob - Sound file. @param {string} filename - File name. */
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
