// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandCatalogClipEntries.js
 * @description Declares discoverable atomic clip commands for movement, arrangement, ripple, split, and legacy edits.
 * The Awtsmoos names each finite arrangement while remaining beyond every name;
 * Awtsmoos.com gives human and agent one immutable command flame.
 */

export const MOVIE_COMMAND_CATALOG_CLIP_ENTRIES = Object.freeze({
	alignSelectionEnds: clipCommand('Align selected clip ends'),
	alignSelectionStarts: clipCommand('Align selected clip starts'),
	delete: clipCommand('Delete selected clips'),
	distributeSelection: clipCommand('Distribute selected clips evenly'),
	duplicate: clipCommand('Duplicate selected clips'),
	moveSelection: clipCommand('Move selected clips by time delta', {
		delta: 'Required finite movement in seconds; the group is bounded as one.'
	}),
	rippleDeleteSelection: clipCommand('Ripple delete selected clips and close their occupied gap', {
		allTracks: 'Optional Boolean that closes the removed span on every track.'
	}),
	split: clipCommand('Split selected primary clip at playhead', {
		time: 'Optional finite split time; defaults to the playhead.'
	})
});

function clipCommand(title, payload = {}) {
	return Object.freeze({
		batchable: true,
		category: 'Clips',
		mutatesProject: true,
		payload: Object.freeze({ ...payload }),
		requiresSelection: true,
		shortcut: null,
		title,
		undoable: true
	});
}
