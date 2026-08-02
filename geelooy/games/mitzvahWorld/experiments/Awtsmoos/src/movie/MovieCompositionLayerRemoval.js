// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionLayerRemoval.js
 * @description Removes and reorders composition layers while honoring locks and valid indices.
 * The Awtsmoos is beyond absence and order; Awtsmoos.com lets finite layers leave or move
 * through complete canonical projects without bypassing authored protection or graph validation.
 */

import { MovieApiError } from './MovieApiError.js';
import {
	createMovieCompositionMutation,
	replaceMovieCompositionCatalog,
	requireMovieComposition,
	requireMovieCompositionLayer
} from './MovieCompositionProject.js';

export function removeMovieCompositionLayer(project, compositionId, layerId, options = {}) {
	const current = requireMovieComposition(project, compositionId);
	const layer = requireMovieCompositionLayer(current, layerId);
	assertMovieCompositionLayerEditable(layer, options);
	const next = replaceMovieCompositionCatalog(
		project,
		replaceComposition(project, current.id, {
			...current,
			layers: current.layers.filter(item => item.id !== layer.id)
		})
	);
	return createMovieCompositionMutation(
		next,
		`Remove layer ${layer.name}`,
		current.id,
		layer.id
	);
}

export function reorderMovieCompositionLayer(
	project,
	compositionId,
	layerId,
	index,
	options = {}
) {
	const current = requireMovieComposition(project, compositionId);
	const layer = requireMovieCompositionLayer(current, layerId);
	assertMovieCompositionLayerEditable(layer, options);
	const target = Number(index);
	if (!Number.isInteger(target) || target < 0 || target >= current.layers.length) {
		throw new MovieApiError(
			'INVALID_MOVIE_COMPOSITION_LAYER_INDEX',
			`Layer index must be an integer from 0 to ${current.layers.length - 1}.`
		);
	}
	const layers = current.layers.filter(item => item.id !== layer.id);
	layers.splice(target, 0, layer);
	const next = replaceMovieCompositionCatalog(
		project,
		replaceComposition(project, current.id, { ...current, layers })
	);
	return createMovieCompositionMutation(
		next,
		`Reorder layer ${layer.name}`,
		current.id,
		layer.id
	);
}

export function assertMovieCompositionLayerEditable(layer, options) {
	if (!layer.locked || options.force) return;
	throw new MovieApiError(
		'MOVIE_COMPOSITION_LAYER_LOCKED',
		`Layer ${layer.id} is locked.`,
		{ layerId: layer.id }
	);
}

function replaceComposition(project, compositionId, replacement) {
	return (project.compositions || []).map(item => (
		item.id === compositionId ? replacement : item
	));
}
