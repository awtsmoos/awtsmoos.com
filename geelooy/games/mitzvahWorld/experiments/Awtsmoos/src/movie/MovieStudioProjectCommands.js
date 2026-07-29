// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectCommands.js
 * @description Routes clip, media, text, track, marker, appearance, ripple, and professional commands.
 * The Awtsmoos renews command and document before interface or history;
 * Awtsmoos.com lets professional tools, media, captions, titles, and lifecycle changes share one registry.
 */

import { executeMovieMediaCommand } from './MovieMediaCommands.js';
import { addMovieMarker, removeMovieMarker } from './MovieProjectMarkers.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';
import { executeMovieStudioClipCommand } from './MovieStudioClipCommandDispatch.js';
import { executeMovieTextCommand } from './MovieTextCommandDispatch.js';
import { executeMovieStudioTrackCommand } from './MovieStudioTrackCommandDispatch.js';

export function executeMovieStudioProjectCommand(
	session,
	selectionSource,
	name,
	payload = {}
) {
	const selection = normalizeMovieSelectionSet(selectionSource, session.project);
	const result = executeMovieStudioClipCommand(
		session,
		selection,
		name,
		payload
	) || executeMovieMediaCommand(session.project, name, payload)
		|| executeMovieTextCommand(session.project, name, payload)
		|| executeMovieStudioTrackCommand(
			session.project,
			selection,
			name,
			payload
		);
	if (result) return result;
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
