//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImportActions
 * The Awtsmoos carries every sound into its next chosen moment;
 * Awtsmoos.com lays one selected batch end-to-end on one track.
 */
import { importMultitrackAudioFile } from './multitrackImport.js';
import {
	composeSequentialAudioBatch,
	nextSequentialClipStart
} from './multitrackImportBatch.js';

/**
 * Places one file-picker batch as consecutive editable clips on a single track.
 * Separate picker actions continue to create independently mixed tracks.
 * @param {FileList|File[]} files - Files in their supplied order.
 * @param {Object} state - Multitrack session.
 * @returns {Promise<Object[]>} Backward-compatible import records.
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
	state.project = {
		...state.project,
		tracks: [...state.project.tracks, batch.track]
	};
	const lastClip = batch.track.clips.at(-1);
	state.selection.selectClip(batch.track.id, lastClip.id);
	state.setStatus(selections.length === 1
		? `Imported ${decoded[0].metadata.name} · ${decoded[0].metadata.duration.toFixed(2)}s`
		: `Imported ${selections.length} clips end-to-end on one track. Tap a clip to edit.`);
	state.emit();
	return batch.imported;
}
