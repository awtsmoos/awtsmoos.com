// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTrackCommandDispatch.js
 * @description Dispatches immutable track lifecycle commands and clears only invalidated selections.
 * The Awtsmoos preserves each chosen clip until its containing lane departs;
 * Awtsmoos.com keeps harmless track changes outside selection concerns and parts.
 */

import {
	addMovieTrack,
	duplicateMovieTrack,
	removeMovieTrack,
	renameMovieTrack,
	reorderMovieTrack,
	setMovieTrackState
} from './MovieTrackCommands.js';

const OPERATIONS = Object.freeze({
	addTrack: addMovieTrack,
	duplicateTrack: duplicateMovieTrack,
	removeTrack: removeMovieTrack,
	renameTrack: renameMovieTrack,
	reorderTrack: reorderMovieTrack,
	setTrackState: setMovieTrackState
});

export function executeMovieStudioTrackCommand(
	project,
	selection,
	name,
	payload
) {
	const operation = OPERATIONS[name];
	if (!operation) return null;
	const result = operation(project, payload);
	if (name !== 'removeTrack') return result;
	const invalidated = selection.items.some(item => (
		item.trackId === result.detail.trackId
	));
	return invalidated ? { ...result, selection: null } : result;
}
