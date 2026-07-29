// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCommandCatalogClipEntries.js
 * @description Declares discoverable clip movement, arrangement, transition, effect, keyframe, ripple, and legacy edits.
 * The Awtsmoos names each finite arrangement while remaining beyond every name;
 * Awtsmoos.com gives human and agent one immutable appearance and editing command flame.
 */

export const MOVIE_COMMAND_CATALOG_CLIP_ENTRIES = Object.freeze({
	addClipEffectKeyframe: clipCommand('Add or replace a selected clip effect keyframe', {
		effectId: 'Required stable effect identity.',
		keyframe: 'Required keyframe with clip-local time, value, and optional easing.'
	}),
	alignSelectionEnds: clipCommand('Align selected clip ends'),
	alignSelectionStarts: clipCommand('Align selected clip starts'),
	delete: clipCommand('Delete selected clips'),
	distributeSelection: clipCommand('Distribute selected clips evenly'),
	duplicate: clipCommand('Duplicate selected clips'),
	moveSelection: clipCommand('Move selected clips by time delta', {
		delta: 'Required finite movement in seconds; the group is bounded as one.'
	}),
	removeClipEffect: clipCommand('Remove an effect from the primary selected clip', {
		effectId: 'Required stable effect identity.'
	}),
	rippleDeleteSelection: clipCommand('Ripple delete selected clips and close their occupied gap', {
		allTracks: 'Optional Boolean that closes the removed span on every track.'
	}),
	setClipTransition: clipCommand('Set or clear a primary selected clip transition', {
		edge: 'Required transition edge: in or out.',
		transition: 'Transition object or null to clear the edge.'
	}),
	split: clipCommand('Split selected primary clip at playhead', {
		time: 'Optional finite split time; defaults to the playhead.'
	}),
	upsertClipEffect: clipCommand('Add or replace an effect on the primary selected clip', {
		effect: 'Required bounded effect object with id, kind, value, and optional keyframes.'
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
