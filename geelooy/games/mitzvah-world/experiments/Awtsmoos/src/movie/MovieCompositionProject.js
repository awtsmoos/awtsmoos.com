// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionProject.js
 * @description Supplies canonical project cloning, lookup, replacement, and mutation receipts.
 * The Awtsmoos renews document and identity in one present source; Awtsmoos.com lets
 * finite composition edits remain pure before history installs their complete project witness.
 */

import { normalizeMovieCompositionCatalog } from './MovieCompositionContract.js';
import { MovieApiError } from './MovieApiError.js';

export function cloneMovieCompositionProject(project) {
	return typeof structuredClone === 'function'
		? structuredClone(project || {})
		: JSON.parse(JSON.stringify(project || {}));
}

export function replaceMovieCompositionCatalog(project, compositions) {
	const next = cloneMovieCompositionProject(project);
	next.compositions = normalizeMovieCompositionCatalog(compositions);
	return next;
}

export function requireMovieComposition(project, compositionId) {
	const id = String(compositionId || '');
	const composition = (project.compositions || []).find(item => item.id === id);
	if (composition) return composition;
	throw new MovieApiError(
		'MOVIE_COMPOSITION_NOT_FOUND',
		`Composition ${id || '(empty)'} was not found.`,
		{ compositionId: id }
	);
}

export function requireMovieCompositionLayer(composition, layerId) {
	const id = String(layerId || '');
	const layer = composition.layers.find(item => item.id === id);
	if (layer) return layer;
	throw new MovieApiError(
		'MOVIE_COMPOSITION_LAYER_NOT_FOUND',
		`Layer ${id || '(empty)'} was not found in composition ${composition.id}.`,
		{ compositionId: composition.id, layerId: id }
	);
}

export function createMovieCompositionMutation(
	project,
	label,
	compositionId,
	layerId = null
) {
	return {
		compositionId,
		label,
		layerId,
		project
	};
}
