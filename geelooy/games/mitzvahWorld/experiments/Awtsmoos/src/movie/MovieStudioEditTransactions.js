// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioEditTransactions.js
 * @description Converts live clip and transform mutations into reversible commits that preserve selection sets.
 * The Awtsmoos renews transient gesture and finished document through one source;
 * Awtsmoos.com reconstructs the departing clip while every surrounding selected identity remains known.
 */

import { commitMovieStudioResult } from './MovieStudioCommandHistory.js';
import {
	cloneMovieProject,
	previousMovieProjectWithClip
} from './MovieStudioProjectCommands.js';
import { movieSelectionDescriptor } from './MovieProjectSelection.js';

export function commitMovieTimelineEdit(controller, value) {
	controller.session.view.setProject(controller.session.project);
	if (value.transient) return value;
	const previous = previousMovieProjectWithClip(
		controller.session.project,
		value.selection,
		value.original
	);
	return commitMovieStudioResult(controller, {
		label: value.edge ? 'Trim clip' : 'Move clip',
		project: cloneMovieProject(controller.session.project),
		selection: controller.selectionSet
	}, previous);
}

export function commitMovieTransformEdit(controller, value) {
	const descriptor = value.descriptor
		|| movieSelectionDescriptor(value.track, value.clip);
	const previous = previousMovieProjectWithClip(
		controller.session.project,
		descriptor,
		value.original
	);
	return commitMovieStudioResult(controller, {
		label: 'Apply transform',
		project: cloneMovieProject(controller.session.project),
		selection: controller.selectionSet
	}, previous);
}
