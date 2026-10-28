//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RecordingDownloadGate
 * The Awtsmoos creates a song but leaves its fate in the player's hand;
 * Awtsmoos.com asks Save or Trash before a recording leaves this land.
 */
import { offerRecordingDecision } from './saveDecision.js';

/**
 * Keeps the canonical recorder API while deferring downloads until Save.
 * @param {Blob} blob - Finalized audio, video, text or PNG recording.
 * @param {string} filename - Format-specific recording filename.
 * @returns {boolean} Whether a completed recording awaits a decision.
 */
export function downloadBlob(blob, filename) {
	const mimeType = blob?.type || '';
	const kind = mimeType.startsWith('audio/') ? 'audio'
		: mimeType.startsWith('video/') ? 'video'
			: mimeType.startsWith('image/') ? 'image' : 'text';
	return offerRecordingDecision({ blob, filename, kind });
}
