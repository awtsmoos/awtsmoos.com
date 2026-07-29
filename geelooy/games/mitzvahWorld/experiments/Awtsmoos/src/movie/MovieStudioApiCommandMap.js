// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCommandMap.js
 * @description Maps stable dotted agent names and internal names onto the complete editor vocabulary.
 * The Awtsmoos is beyond alias and implementation while every finite caller receives one durable gate;
 * Awtsmoos.com preserves legacy spellings as tools, appearance, trims, media, text, tracks, and history evolve.
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
	'clip.rateStretch': 'rateStretchClip',
	'clip.removeEffect': 'removeClipEffect',
	'clip.rippleDelete': 'rippleDeleteSelection',
	'clip.rippleTrim': 'rippleTrimClip',
	'clip.roll': 'rollClip',
	'clip.setTransition': 'setClipTransition',
	'clip.slide': 'slideClip',
	'clip.slip': 'slipClip',
	'clip.split': 'split',
	'clip.upsertEffect': 'upsertClipEffect',
	'history.redo': 'redo',
	'history.undo': 'undo',
	'marker.add': 'addMarker',
	'marker.remove': 'removeMarker',
	'media.add': 'addMedia',
	'media.relink': 'relinkMedia',
	'media.remove': 'removeMedia',
	'media.replaceReferences': 'replaceMediaReferences',
	'media.update': 'updateMedia',
	'text.addCaption': 'addCaption',
	'text.addTitle': 'addTitle',
	'text.importCaptions': 'importCaptions',
	'text.removeCaption': 'removeCaption',
	'text.removeTitle': 'removeTitle',
	'text.updateCaption': 'updateCaption',
	'text.updateTitle': 'updateTitle',
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
	'addCaption', 'addClipEffectKeyframe', 'addMarker', 'addMedia', 'addTitle',
	'addTrack', 'alignSelectionEnds', 'alignSelectionStarts', 'delete',
	'distributeSelection', 'duplicate', 'duplicateTrack', 'importCaptions',
	'moveSelection', 'rateStretchClip', 'redo', 'relinkMedia', 'removeCaption',
	'removeClipEffect', 'removeMarker', 'removeMedia', 'removeTitle',
	'removeTrack', 'renameTrack', 'reorderTrack', 'replaceMediaReferences',
	'rippleDeleteSelection', 'rippleTrimClip', 'rollClip', 'setClipTransition',
	'setSnapping', 'setTimelineTool', 'setTrackState', 'slideClip', 'slipClip',
	'split', 'toggleSnap', 'undo', 'updateCaption', 'updateMedia', 'updateTitle',
	'upsertClipEffect'
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
