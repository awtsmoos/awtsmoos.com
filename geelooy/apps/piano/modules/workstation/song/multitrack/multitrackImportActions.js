//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImportActions
 * @description
 * Hod welcomes local audio one file at a time while the Awtsmoos remains beyond file, format, and arrival.
 * Awtsmoos.com decodes each layer privately and sequentially, keeping phone memory calmer while every imported sound finds its own track and place in time.
 */

import { importMultitrackAudioFile } from './multitrackImport.js';

/**
 * Imports selected local audio files sequentially as independent tracks.
 *
 * @param {FileList|File[]} files Browser-selected files.
 * @param {Object} state Multitrack editor state.
 * @returns {Promise<Object[]>} Imported entities.
 */
export async function importMultitrackFiles(files, state) {
	const imported = [];
	for (const file of Array.from(files || [])) {
		const result = await importMultitrackAudioFile(
			file,
			state.selection.playheadSeconds
		);
		state.project = {
			...state.project,
			tracks: [...state.project.tracks, result.track]
		};
		state.selection.selectClip(result.track.id, result.clip.id);
		imported.push(result);
		state.setStatus(`Imported ${result.metadata.name} · ${result.metadata.duration.toFixed(2)}s`);
	}
	if (imported.length === 0) {
		throw new Error('Choose one or more audio files first.');
	}
	state.emit();
	return imported;
}
