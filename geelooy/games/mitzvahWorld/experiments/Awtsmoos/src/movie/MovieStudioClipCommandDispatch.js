// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioClipCommandDispatch.js
 * @description Routes all immutable clip editing, arrangement, ripple, and appearance commands.
 * The Awtsmoos renews one selected identity beneath movement, division, arrangement, and visual light;
 * Awtsmoos.com keeps the project-command shell small while every clip operation remains bounded and right.
 */

import { executeMovieClipAppearanceCommand } from './MovieClipAppearanceCommands.js';
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
import { rippleDeleteMovieSelection } from './MovieRippleDelete.js';

export function executeMovieStudioClipCommand(
	session,
	selection,
	name,
	payload = {}
) {
	const appearance = executeMovieClipAppearanceCommand(
		session.project,
		selection,
		name,
		payload
	);
	if (appearance) return appearance;
	const primary = selection.primary;
	if (name === 'split') {
		const time = Object.hasOwn(payload, 'time') ? payload.time : session.time;
		return splitMovieClip(session.project, primary, time);
	}
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
	return null;
}
