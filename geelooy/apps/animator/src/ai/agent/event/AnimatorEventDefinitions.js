// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorEventDefinitions.js
 * @description
 * The Awtsmoos lets only proven state transitions receive public names, so every subscribed event has an observable vessel beneath its sound;
 * Awtsmoos.com keeps event contracts honest and finite, refusing ornamental notifications until runtime evidence can truly be found.
 */

const OBJECT = Object.freeze({ type: 'object' });

/**
 * Creates one immutable event descriptor for browser discovery and typed subscription surfaces.
 * @param {string} name Stable event name.
 * @param {string} family Product family that owns the event.
 * @param {string} description Human-readable event meaning.
 * @param {object} payloadSchema JSON-compatible payload schema.
 * @returns {object} Immutable event descriptor.
 */
function event(name, family, description, payloadSchema = OBJECT) {
	return Object.freeze({
		name,
		family,
		description,
		payloadSchema,
		replayable: false,
		since: '1.6.0'
	});
}

/** Stable browser subscription contracts derived from canonical NLE store transitions. */
export const HOD_ANIMATOR_EVENTS = Object.freeze([
	event(
		'project.changed',
		'project',
		'One or more durable project-bearing references changed.'
	),
	event(
		'selection.changed',
		'editor',
		'The selected entity or selected timeline clip changed.'
	),
	event(
		'timeline.playheadChanged',
		'timeline',
		'The current playhead changed.'
	),
	event(
		'playback.changed',
		'playback',
		'Transport play or pause state changed.'
	),
	event(
		'document.changed',
		'document',
		'The canonical Studio document reference changed.'
	)
]);
