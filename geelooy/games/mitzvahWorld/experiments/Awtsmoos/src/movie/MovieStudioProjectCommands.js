// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioProjectCommands.js
 * @description Routes clip, track, marker, and arrangement commands through immutable project operations.
 * The Awtsmoos renews command and document before interface or history;
 * Awtsmoos.com lets legacy edits and professional lifecycle changes share one registry.
 */

import {
	deleteMovieClip,
	duplicateMovieClip,
	splitMovieClip
} from './MovieClipCommands.js';
import {
	alignSelectedMovieClips,
	distributeSelectedMovieClips
} from './MovieMultiClipArrange.js';
import {
	deleteSelectedMovieClips,
	duplicateSelectedMovieClips
} from './MovieMultiClipCommands.js';
import { moveSelectedMovieClips } from './MovieMultiClipMove.js';
import { addMovieMarker, removeMovieMarker } from './MovieProjectMarkers.js';
import { resolveMovieSelection } from './MovieProjectSelection.js';
import { rippleDeleteMovieSelection } from './MovieRippleDelete.js';
import { normalizeMovieSelectionSet } from './MovieSelectionSet.js';
import { executeMovieStudioTrackCommand } from './MovieStudioTrackCommandDispatch.js';

export function executeMovieStudioProjectCommand(
	session,
	selectionSource,
	name,
	payload = {}
) {
	const selection = normalizeMovieSelectionSet(selectionSource, session.project);
	const primary = selection.primary;
	if (name === 'split') return splitMovieClip(session.project, primary, session.time);
	if (name === 'duplicate') {
		return duplicateSelectedMovieClips(session.project, selection)
			|| duplicateMovieClip(session.project, primary);
	}
	if (name === 'delete') {
		return selection.items.length > 1
			? deleteSelectedMovieClips(session.project, selection)
			: deleteMovieClip(session.project, primary);
	}
	if (name === 'moveSelection') {
		return moveSelectedMovieClips(session.project, selection, payload.delta);
	}
	if (name === 'alignSelectionStarts') {
		return alignSelectedMovieClips(session.project, selection, 'start');
	}
	if (name === 'alignSelectionEnds') {
		return alignSelectedMovieClips(session.project, selection, 'end');
	}
	if (name === 'distributeSelection') {
		return distributeSelectedMovieClips(session.project, selection);
	}
	if (name === 'rippleDeleteSelection') {
		return rippleDeleteMovieSelection(session.project, selection);
	}
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
