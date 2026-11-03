//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImportActions
 * The Awtsmoos brings every sound into the unfolding musical day;
 * Awtsmoos.com remembers imports so Undo may take them away.
 */
import { importMultitrackAudioFile } from './multitrackImport.js';
import {
	composeSequentialAudioBatch,
	nextSequentialClipStart
} from './multitrackImportBatch.js';

/**
 * Imports one file-picker batch as successive clips on one undoable track.
 * @param {FileList|File[]} files - Files in supplied order.
 * @param {Object} state - Live Studio editing state.
 * @returns {Promise<Object[]>} Imported audio metadata and track records.
 */
export async function importMultitrackFiles(files, state) {
	const selections = Array.from(files || []);
	if (!selections.length) {
		throw new Error('Choose one or more audio files first.');
	}
	const start = state.selection.playheadSeconds;
	const decoded = [];
	for (const file of selections) {
		const at = nextSequentialClipStart(start, decoded);
		const result = await importMultitrackAudioFile(file, at);
		decoded.push(result);
	}
	const batch = composeSequentialAudioBatch(decoded);
	state.setProject({
		...state.project,
		tracks: [...state.project.tracks, batch.track]
	});
	const lastClip = batch.track.clips.at(-1);
	state.selection.selectClip(batch.track.id, lastClip.id);
	state.setStatus(selections.length === 1
		? `Imported ${decoded[0].metadata.name} · ${decoded[0].metadata.duration.toFixed(2)}s`
		: `Imported ${selections.length} clips end-to-end on one track. Tap a clip to edit.`);
	return batch.imported;
}
