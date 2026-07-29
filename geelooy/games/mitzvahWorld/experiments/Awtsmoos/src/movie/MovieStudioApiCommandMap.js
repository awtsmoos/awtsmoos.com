// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommandMap.js
 * @description Maps stable dotted agent names and internal names onto the complete editor vocabulary.
 * The Awtsmoos is beyond alias and implementation while every finite caller receives one durable gate;
 * Awtsmoos.com preserves legacy spellings as tools, appearance, tracks, clips, markers, and history evolve in state.
 */

import { MovieApiError } from './MovieApiError.js';

const ALIASES = Object.freeze({
	'clip.addEffectKeyframe': 'addClipEffectKeyframe',
	'clip.alignEnds': 'alignSelectionEnds',
	'clip.alignStarts': 'alignSelectionStarts',
	'clip.delete': 'delete',
	'clip.distribute': 'distributeSelection',
	'clip.duplicate': 'duplicate',
	'clip.move': 'moveSelection',
	'clip.moveSelection': 'moveSelection',
	'clip.removeEffect': 'removeClipEffect',
	'clip.rippleDelete': 'rippleDeleteSelection',
	'clip.setTransition': 'setClipTransition',
	'clip.split': 'split',
	'clip.upsertEffect': 'upsertClipEffect',
	'history.redo': 'redo',
	'history.undo': 'undo',
	'marker.add': 'addMarker',
	'marker.remove': 'removeMarker',
	'timeline.setSnapping': 'setSnapping',
	'timeline.setTool': 'setTimelineTool',
	'timeline.toggleSnapping': 'toggleSnap',
	'track.add': 'addTrack',
	'track.duplicate': 'duplicateTrack',
	'track.remove': 'removeTrack',
	'track.rename': 'renameTrack',
	'track.reorder': 'reorderTrack',
	'track.setState': 'setTrackState'
});

const INTERNAL = new Set([
	'addClipEffectKeyframe', 'addMarker', 'addTrack', 'alignSelectionEnds',
	'alignSelectionStarts', 'delete', 'distributeSelection', 'duplicate',
	'duplicateTrack', 'moveSelection', 'redo', 'removeClipEffect',
	'removeMarker', 'removeTrack', 'renameTrack', 'reorderTrack',
	'rippleDeleteSelection', 'setClipTransition', 'setSnapping',
	'setTimelineTool', 'setTrackState', 'split', 'toggleSnap',
	'undo', 'upsertClipEffect'
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

export function resolveMovieStudioCommandName(value) {
	try {
		return normalizeMovieApiCommandName(value);
	} catch {
		return null;
	}
}

export function movieStudioCommandAliases() {
	return { ...ALIASES };
}
