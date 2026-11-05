// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionMutations.js
 * @description Creates, updates, duplicates, and safely removes reusable compositions.
 * The Awtsmoos renews identity without collision or loss; Awtsmoos.com lets finite canvases
 * be born, refined, copied, and removed while references remain explicit and history-ready.
 */

import { normalizeMovieComposition } from './MovieCompositionContract.js';
import { findMovieCompositionUsages } from './MovieCompositionGraph.js';
import { MovieApiError } from './MovieApiError.js';
import {
	createMovieCompositionMutation,
	replaceMovieCompositionCatalog,
	requireMovieComposition
} from './MovieCompositionProject.js';

export function createMovieComposition(project, source) {
	const composition = normalizeMovieComposition(source, (project.compositions || []).length);
	const next = replaceMovieCompositionCatalog(
		project,
		[...(project.compositions || []), composition]
	);
	return createMovieCompositionMutation(
		next,
		`Create composition ${composition.name}`,
		composition.id
	);
}

export function updateMovieComposition(project, compositionId, patch = {}) {
	const current = requireMovieComposition(project, compositionId);
	assertStableId(current.id, patch.id);
	const compositions = (project.compositions || []).map(item => (
		item.id === current.id ? { ...item, ...patch, id: current.id } : item
	));
	const next = replaceMovieCompositionCatalog(project, compositions);
	const updated = requireMovieComposition(next, current.id);
	return createMovieCompositionMutation(
		next,
		`Update composition ${updated.name}`,
		updated.id
	);
}

export function duplicateMovieComposition(project, compositionId, source = {}) {
	const current = requireMovieComposition(project, compositionId);
	const duplicate = normalizeMovieComposition({
		...current,
		...source,
		id: source.id,
		name: source.name || `${current.name} Copy`
	}, (project.compositions || []).length);
	const next = replaceMovieCompositionCatalog(
		project,
		[...(project.compositions || []), duplicate]
	);
	return createMovieCompositionMutation(
		next,
		`Duplicate composition ${current.name}`,
		duplicate.id
	);
}

export function removeMovieComposition(project, compositionId, options = {}) {
	const current = requireMovieComposition(project, compositionId);
	const usages = findMovieCompositionUsages(project.compositions || [], current.id);
	if (usages.length && !options.force) {
		throw new MovieApiError(
			'MOVIE_COMPOSITION_IN_USE',
			`Composition ${current.id} is used by ${usages.join(', ')}.`,
			{ compositionId: current.id, usages }
		);
	}
	const compositions = (project.compositions || [])
		.filter(item => item.id !== current.id)
		.map(item => options.force ? {
			...item,
			layers: item.layers.filter(layer => !(
				layer.kind === 'composition' && layer.sourceId === current.id
			))
		} : item);
	const next = replaceMovieCompositionCatalog(project, compositions);
	return createMovieCompositionMutation(
		next,
		`Remove composition ${current.name}`,
		current.id
	);
}

function assertStableId(currentId, candidateId) {
	if (candidateId == null || String(candidateId) === currentId) return;
	throw new MovieApiError(
		'MOVIE_COMPOSITION_ID_IMMUTABLE',
		'Composition ids are immutable; duplicate the composition to create a new identity.'
	);
}
