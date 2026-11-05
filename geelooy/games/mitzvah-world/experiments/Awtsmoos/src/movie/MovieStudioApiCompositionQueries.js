// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCompositionQueries.js
 * @description Exposes immutable composition catalogs, graphs, dependencies, schemas, and render plans.
 * The Awtsmoos knows every layer without changing it; Awtsmoos.com gives artists and agents
 * read-only witnesses of nested time, finite capability, and the exact plan a renderer receives.
 */

import { normalizeMovieCompositionCatalog } from './MovieCompositionContract.js';
import {
	MOVIE_COMPOSITION_BLEND_MODES,
	MOVIE_COMPOSITION_LAYER_KINDS,
	MOVIE_COMPOSITION_LIMITS,
	MOVIE_COMPOSITION_MASK_MODES,
	MOVIE_COMPOSITION_SCHEMA_VERSION
} from './MovieCompositionConstants.js';
import { evaluateMovieComposition } from './MovieCompositionEvaluator.js';
import {
	createMovieCompositionGraph,
	findMovieCompositionDependencies,
	findMovieCompositionUsages
} from './MovieCompositionGraph.js';
import { requireMovieComposition } from './MovieCompositionProject.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioCompositionQueries(session) {
	const catalog = () => normalizeMovieCompositionCatalog(session.project.compositions);
	return Object.freeze({
		dependencies: compositionId => findMovieCompositionDependencies(
			catalog(),
			compositionId
		),
		evaluate: (compositionId, time) => evaluateMovieComposition(
			catalog(),
			compositionId,
			time
		),
		get: compositionId => createMovieProjectSnapshot(requireMovieComposition(
			{ compositions: catalog() },
			compositionId
		)),
		graph: () => createMovieCompositionGraph(catalog()),
		list: () => createMovieProjectSnapshot(catalog()),
		schema: () => createMovieProjectSnapshot({
			blendModes: MOVIE_COMPOSITION_BLEND_MODES,
			layerKinds: MOVIE_COMPOSITION_LAYER_KINDS,
			limits: MOVIE_COMPOSITION_LIMITS,
			maskModes: MOVIE_COMPOSITION_MASK_MODES,
			version: MOVIE_COMPOSITION_SCHEMA_VERSION
		}),
		usages: compositionId => findMovieCompositionUsages(catalog(), compositionId)
	});
}
