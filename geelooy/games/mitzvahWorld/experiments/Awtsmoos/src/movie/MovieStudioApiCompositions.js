// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCompositions.js
 * @description Exposes revisioned composition and layer authoring beside immutable graph queries.
 * The Awtsmoos renews canvas and edit before API or interface; Awtsmoos.com joins finite
 * creation, nesting, masking, timing, undo, and evaluation through one stable public domain.
 */

import {
	addMovieCompositionLayer,
	updateMovieCompositionLayer
} from './MovieCompositionLayerMutations.js';
import {
	removeMovieCompositionLayer,
	reorderMovieCompositionLayer
} from './MovieCompositionLayerRemoval.js';
import {
	createMovieComposition,
	duplicateMovieComposition,
	removeMovieComposition,
	updateMovieComposition
} from './MovieCompositionMutations.js';
import { runMovieStudioCompositionMutation } from './MovieStudioApiCompositionMutation.js';
import { createMovieStudioCompositionQueries } from './MovieStudioApiCompositionQueries.js';

export function createMovieStudioCompositionsDomain(session) {
	const mutate = (operation, options, action) => runMovieStudioCompositionMutation(
		session,
		operation,
		options,
		action
	);
	const layers = createLayersDomain(session, mutate);
	return Object.freeze({
		...createMovieStudioCompositionQueries(session),
		create: (source, options = {}) => mutate(
			'compositions.create',
			options,
			() => createMovieComposition(session.project, source)
		),
		duplicate: (compositionId, source = {}, options = {}) => mutate(
			'compositions.duplicate',
			options,
			() => duplicateMovieComposition(session.project, compositionId, source)
		),
		layers,
		remove: (compositionId, options = {}) => mutate(
			'compositions.remove',
			options,
			() => removeMovieComposition(session.project, compositionId, options)
		),
		update: (compositionId, patch, options = {}) => mutate(
			'compositions.update',
			options,
			() => updateMovieComposition(session.project, compositionId, patch)
		)
	});
}

function createLayersDomain(session, mutate) {
	return Object.freeze({
		add: (compositionId, source, options = {}) => mutate(
			'compositions.layers.add',
			options,
			() => addMovieCompositionLayer(session.project, compositionId, source)
		),
		remove: (compositionId, layerId, options = {}) => mutate(
			'compositions.layers.remove',
			options,
			() => removeMovieCompositionLayer(
				session.project,
				compositionId,
				layerId,
				options
			)
		),
		reorder: (compositionId, layerId, index, options = {}) => mutate(
			'compositions.layers.reorder',
			options,
			() => reorderMovieCompositionLayer(
				session.project,
				compositionId,
				layerId,
				index,
				options
			)
		),
		update: (compositionId, layerId, patch, options = {}) => mutate(
			'compositions.layers.update',
			options,
			() => updateMovieCompositionLayer(
				session.project,
				compositionId,
				layerId,
				patch,
				options
			)
		)
	});
}
