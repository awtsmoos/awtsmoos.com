// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandCatalogEntries.js
 * @description Composes immutable clip, media, text, track, marker, history, snapping, and tool metadata.
 * The Awtsmoos gathers many command vessels beneath one discoverable light;
 * Awtsmoos.com keeps each focused module small, truthful, agent-readable, and right.
 */

import { MOVIE_COMMAND_CATALOG_CLIP_ENTRIES } from './MovieCommandCatalogClipEntries.js';
import { MOVIE_COMMAND_CATALOG_MEDIA_TEXT_ENTRIES } from './MovieCommandCatalogMediaTextEntries.js';
import { MOVIE_COMMAND_CATALOG_TRACK_ENTRIES } from './MovieCommandCatalogTrackEntries.js';

export const MOVIE_COMMAND_CATALOG_ENTRIES = Object.freeze({
	...MOVIE_COMMAND_CATALOG_CLIP_ENTRIES,
	...MOVIE_COMMAND_CATALOG_MEDIA_TEXT_ENTRIES,
	...MOVIE_COMMAND_CATALOG_TRACK_ENTRIES,
	addMarker: commandEntry({
		batchable: true,
		category: 'Markers',
		mutatesProject: true,
		payload: {
			label: 'Optional marker label.',
			time: 'Optional finite project time; defaults to the playhead.'
		},
		title: 'Add marker',
		undoable: true
	}),
	redo: commandEntry({
		category: 'History',
		mutatesProject: true,
		title: 'Redo edit'
	}),
	removeMarker: commandEntry({
		batchable: true,
		category: 'Markers',
		mutatesProject: true,
		payload: { markerId: 'Required stable marker identity.' },
		title: 'Remove marker',
		undoable: true
	}),
	setSnapping: commandEntry({
		category: 'Timeline',
		payload: { enabled: 'Required Boolean snapping state.' },
		title: 'Set timeline snapping'
	}),
	setTimelineTool: commandEntry({
		category: 'Timeline',
		payload: { tool: 'Required supported timeline tool.' },
		title: 'Set timeline editing tool'
	}),
	toggleSnap: commandEntry({
		category: 'Timeline',
		shortcut: 'S',
		title: 'Toggle timeline snapping'
	}),
	undo: commandEntry({
		category: 'History',
		mutatesProject: true,
		shortcut: 'Mod+Z',
		title: 'Undo edit'
	})
});

function commandEntry(source) {
	return Object.freeze({
		batchable: Boolean(source.batchable),
		category: String(source.category || 'General'),
		mutatesProject: Boolean(source.mutatesProject),
		payload: Object.freeze({ ...(source.payload || {}) }),
		requiresSelection: Boolean(source.requiresSelection),
		shortcut: source.shortcut == null ? null : String(source.shortcut),
		title: String(source.title),
		undoable: Boolean(source.undoable)
	});
}
