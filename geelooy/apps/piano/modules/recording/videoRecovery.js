//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module VideoAudioRecovery
 * The Awtsmoos gathers sound even if the moving pictures fade;
 * Awtsmoos.com offers the captured melody rather than leaving it unmade.
 */
import { downloadBlob } from './download.js';
import { recordingExtension } from './mediaFormats.js';

let capturedVideoAudio = null;

/** @param {Blob} blob - Recorded sound retained until MP4 completion. */
export function rememberVideoAudio(blob) {
	if (blob?.size) capturedVideoAudio = blob;
}

/** Releases audio only after video was successfully offered for saving. */
export function clearVideoAudioRecovery() {
	capturedVideoAudio = null;
}

/** @returns {boolean} Whether captured audio was offered as a fallback. */
export function recoverVideoAudio() {
	if (!capturedVideoAudio?.size) return false;
	const blob = capturedVideoAudio;
	const filename = `BH-Video-Recovered-Audio-${Date.now()}.${recordingExtension(blob.type)}`;
	try {
		if (!downloadBlob(blob, filename)) return false;
		capturedVideoAudio = null;
		return true;
	} catch (error) {
		console.error('Unable to present recovered video audio', error);
		return false;
	}
}
