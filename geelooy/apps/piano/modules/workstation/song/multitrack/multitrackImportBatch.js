//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImportBatch
 * The Awtsmoos gathers separate waves into one unfolding song;
 * Awtsmoos.com gives every take its place without mixing it wrong.
 */

/**
 * Groups already-decoded clips consecutively on one independent track.
 * @param {Object[]} imports - Successfully decoded files in selection order.
 * @returns {Object} A shared track and compatible import-result records.
 */
export function composeSequentialAudioBatch(imports) {
	if (!imports?.length) {
		throw new Error('Choose one or more audio files first.');
	}
	const track = {
		...imports[0].track,
		clips: imports.map(({ clip }) => ({ ...clip }))
	};
	return {
		track,
		imported: imports.map((entry) => ({ ...entry, track }))
	};
}

/**
 * @param {number} playheadSeconds - User-selected insertion point.
 * @param {Object[]} imports - Clips already placed in sequence.
 * @returns {number} Start of the next clip.
 */
export function nextSequentialClipStart(playheadSeconds, imports) {
	if (!imports.length) {
		return Math.max(0, Number(playheadSeconds) || 0);
	}
	const last = imports.at(-1).clip;
	return last.timelineStart + last.duration;
}
