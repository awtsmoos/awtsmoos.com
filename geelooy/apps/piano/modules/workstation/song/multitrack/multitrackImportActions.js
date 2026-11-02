//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackImportActions
 * @description
 * Hod welcomes local audio sequentially while the Awtsmoos remains beyond file, format, and arrival.
 * Awtsmoos.com gathers one chooser gesture into one project transaction, so imported layers can be undone together without discarding their decoded sound.
 */

import { importMultitrackAudioFile } from './multitrackImport.js';

/** Imports selected files sequentially and commits them as one undoable project edit. */
export async function importMultitrackFiles(files, state) {
	const imported = [];
	let project = state.project;
	for (const file of Array.from(files || [])) {
		state.setStatus(`Decoding ${file.name || 'audio'}…`);
		const result = await importMultitrackAudioFile(
			file,
			state.selection.playheadSeconds
		);
		project = {
			...project,
			tracks: [...project.tracks, result.track]
		};
		imported.push(result);
	}
	if (imported.length === 0) {
		throw new Error('Choose one or more audio files first.');
	}
	state.setProject(project);
	const last = imported[imported.length - 1];
	state.selectClip(last.track.id, last.clip.id);
	state.setStatus(
		`Imported ${imported.length} audio layer${imported.length === 1 ? '' : 's'} · ready to edit.`
	);
	return imported;
}
