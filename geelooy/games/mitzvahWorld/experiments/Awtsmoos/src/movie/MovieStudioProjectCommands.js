// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectCommands.js
 * @description Routes clip, track, marker, appearance, arrangement, ripple, and pointer-time commands.
 * The Awtsmoos renews command and document before interface or history;
 * Awtsmoos.com lets professional tools and lifecycle changes share one truthful registry.
 */

import { addMovieMarker, removeMovieMarker } from './MovieProjectMarkers.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';
import { executeMovieStudioClipCommand } from './MovieStudioClipCommandDispatch.js';
import { executeMovieStudioTrackCommand } from './MovieStudioTrackCommandDispatch.js';

export function executeMovieStudioProjectCommand(
	session,
	selectionSource,
	name,
	payload = {}
) {
	const selection = normalizeMovieSelectionSet(selectionSource, session.project);
	const clipResult = executeMovieStudioClipCommand(
		session,
		selection,
		name,
		payload
	);
	if (clipResult) return clipResult;
	const trackResult = executeMovieStudioTrackCommand(
		session.project,
		selection,
		name,
		payload
	);
	if (trackResult) return trackResult;
	if (name === 'addMarker') {
		return addMovieMarker(
			session.project,
			movieMarkerCommandTime(session, payload),
			payload.label
		);
	}
	if (name === 'removeMarker') {
		return removeMovieMarker(session.project, payload.markerId);
	}
	throw new Error(`Unknown movie project command: ${name}`);
}

export function previousMovieProjectWithClip(project, descriptor, original) {
	const previous = cloneMovieProject(project);
	const selection = resolveMovieSelection(previous, descriptor);
	if (selection && original) {
		Object.assign(selection.clip, cloneMovieProject(original));
	}
	return previous;
}

export function cloneMovieProject(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}

function movieMarkerCommandTime(session, payload) {
	return Object.hasOwn(payload, 'time') ? payload.time : session.time;
}
