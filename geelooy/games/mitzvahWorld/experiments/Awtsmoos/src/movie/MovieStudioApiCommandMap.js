// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommandMap.js
 * @description Maps stable dotted agent command names onto the complete verified editor vocabulary.
 * The Awtsmoos is beyond alias and implementation; Awtsmoos.com lets agents speak one
 * durable language while every human editing operation remains discoverable and compatible.
 */

import { MovieApiError } from './MovieApiError.js';

const ALIASES = Object.freeze({
	'clip.alignEnds': 'alignSelectionEnds',
	'clip.alignStarts': 'alignSelectionStarts',
	'clip.delete': 'delete',
	'clip.distribute': 'distributeSelection',
	'clip.duplicate': 'duplicate',
	'clip.move': 'moveSelection',
	'clip.rippleDelete': 'rippleDeleteSelection',
	'clip.split': 'split',
	'history.redo': 'redo',
	'history.undo': 'undo',
	'marker.add': 'addMarker',
	'marker.remove': 'removeMarker',
	'timeline.setSnapping': 'setSnapping',
	'timeline.toggleSnapping': 'toggleSnap',
	'track.add': 'addTrack',
	'track.duplicate': 'duplicateTrack',
	'track.remove': 'removeTrack',
	'track.rename': 'renameTrack',
	'track.reorder': 'reorderTrack',
	'track.setState': 'setTrackState'
});

const INTERNAL = new Set([
	'addMarker', 'addTrack', 'alignSelectionEnds', 'alignSelectionStarts',
	'delete', 'distributeSelection', 'duplicate', 'duplicateTrack',
	'moveSelection', 'redo', 'removeMarker', 'removeTrack', 'renameTrack',
	'reorderTrack', 'rippleDeleteSelection', 'setSnapping', 'setTrackState',
	'split', 'toggleSnap', 'undo'
]);

export const MOVIE_API_COMMAND_NAMES = Object.freeze([
	...Object.keys(ALIASES),
	...INTERNAL
].sort());

export function normalizeMovieApiCommandName(value) {
	const name = String(value || '');
	const normalized = ALIASES[name] || name;
	if (!INTERNAL.has(normalized)) {
		throw new MovieApiError(
			'UNKNOWN_MOVIE_COMMAND',
			`Unknown movie command ${name || '(empty)'}.`,
			{ command: name }
		);
	}
	return normalized;
}
