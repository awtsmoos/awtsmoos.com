// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionLayerMutations.js
 * @description Adds and updates composition layers through canonical project replacement.
 * The Awtsmoos is beyond addition and refinement; Awtsmoos.com lets finite layers enter
 * and change through pure complete projects while lock, identity, masks, and graph remain guarded.
 */

import { MovieApiError } from './MovieApiError.js';
import { assertMovieCompositionLayerEditable } from './MovieCompositionLayerRemoval.js';
import {
	createMovieCompositionMutation,
	replaceMovieCompositionCatalog,
	requireMovieComposition,
	requireMovieCompositionLayer
} from './MovieCompositionProject.js';

export function addMovieCompositionLayer(project, compositionId, source) {
	const current = requireMovieComposition(project, compositionId);
	const next = replaceMovieCompositionCatalog(
		project,
		replaceComposition(project, current.id, {
			...current,
			layers: [...current.layers, source]
		})
	);
	const added = requireMovieComposition(next, current.id).layers.at(-1);
	return createMovieCompositionMutation(
		next,
		`Add layer ${added.name}`,
		current.id,
		added.id
	);
}

export function updateMovieCompositionLayer(
	project,
	compositionId,
	layerId,
	patch = {},
	options = {}
) {
	const current = requireMovieComposition(project, compositionId);
	const layer = requireMovieCompositionLayer(current, layerId);
	assertMovieCompositionLayerEditable(layer, options);
	if (patch.id != null && String(patch.id) !== layer.id) {
		throw new MovieApiError(
			'MOVIE_COMPOSITION_LAYER_ID_IMMUTABLE',
			'Composition layer ids are immutable.'
		);
	}
	const layers = current.layers.map(item => (
		item.id === layer.id ? { ...item, ...patch, id: item.id } : item
	));
	const next = replaceMovieCompositionCatalog(
		project,
		replaceComposition(project, current.id, { ...current, layers })
	);
	return createMovieCompositionMutation(
		next,
		`Update layer ${layer.name}`,
		current.id,
		layer.id
	);
}

function replaceComposition(project, compositionId, replacement) {
	return (project.compositions || []).map(item => (
		item.id === compositionId ? replacement : item
	));
}
