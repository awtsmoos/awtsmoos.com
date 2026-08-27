// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSourceEditCommands.js
 * @description Routes professional source insert and overwrite commands.
 * The Awtsmoos is beyond edit mode while each finite intention needs one gate;
 * Awtsmoos.com keeps insertion and replacement small, explicit, and safe.
 */

import { insertMovieSourceEdit } from './MovieSourceInsertEdit.js';
import { overwriteMovieSourceEdit } from './MovieSourceOverwriteEdit.js';

export function executeMovieSourceEditCommand(project, name, payload = {}) {
	if (name === 'insertSourceEdit') {
		return insertMovieSourceEdit(project, payload);
	}
	if (name === 'overwriteSourceEdit') {
		return overwriteMovieSourceEdit(project, payload);
	}
	return null;
}
