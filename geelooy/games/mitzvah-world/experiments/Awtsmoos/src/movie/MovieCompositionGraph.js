// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCompositionGraph.js
 * @description Validates nested composition references and exposes deterministic dependency queries.
 * The Awtsmoos includes every level without recursion or lack; Awtsmoos.com guards finite
 * nesting from missing vessels and cycles while revealing each reusable composition relationship.
 */

import { MOVIE_COMPOSITION_LIMITS } from './MovieCompositionConstants.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function validateMovieCompositionGraph(compositions) {
	const graph = prepareGraph(compositions);
	for (const id of graph.byId.keys()) visitGraph(id, graph, [], new Set());
	return true;
}

export function createMovieCompositionGraph(compositions) {
	const graph = prepareGraph(compositions);
	for (const id of graph.byId.keys()) visitGraph(id, graph, [], new Set());
	return createMovieProjectSnapshot({
		edges: [...graph.references].flatMap(([from, targets]) => (
			[...targets].map(to => ({ from, to }))
		)),
		nodes: [...graph.byId.values()].map(item => ({
			id: item.id,
			layerCount: item.layers.length,
			name: item.name
		}))
	});
}

export function findMovieCompositionDependencies(compositions, compositionId) {
	const graph = prepareGraph(compositions);
	requireComposition(graph, compositionId);
	const found = new Set();
	const visit = id => graph.references.get(id).forEach(target => {
		if (found.has(target)) return;
		found.add(target);
		visit(target);
	});
	visit(String(compositionId));
	return createMovieProjectSnapshot([...found]);
}

export function findMovieCompositionUsages(compositions, compositionId) {
	const graph = prepareGraph(compositions);
	const id = String(compositionId);
	requireComposition(graph, id);
	return createMovieProjectSnapshot([...graph.references]
		.filter(([, targets]) => targets.has(id))
		.map(([source]) => source));
}

function prepareGraph(compositions) {
	const byId = new Map(compositions.map(item => [item.id, item]));
	const references = new Map();
	for (const composition of compositions) {
		const targets = new Set(composition.layers
			.filter(layer => layer.kind === 'composition')
			.map(layer => layer.sourceId));
		for (const target of targets) requireComposition({ byId }, target, composition.id);
		references.set(composition.id, targets);
	}
	return { byId, references };
}

function visitGraph(id, graph, path, complete) {
	if (path.includes(id)) {
		throw new MovieApiError(
			'MOVIE_COMPOSITION_CYCLE',
			`Composition cycle: ${[...path, id].join(' -> ')}.`
		);
	}
	if (complete.has(id)) return;
	const nextPath = [...path, id];
	if (nextPath.length > MOVIE_COMPOSITION_LIMITS.nestingDepth) {
		throw new MovieApiError(
			'MOVIE_COMPOSITION_NESTING_LIMIT',
			`Composition nesting exceeds ${MOVIE_COMPOSITION_LIMITS.nestingDepth} levels.`
		);
	}
	graph.references.get(id).forEach(target => visitGraph(target, graph, nextPath, complete));
	complete.add(id);
}

function requireComposition(graph, compositionId, ownerId = null) {
	const id = String(compositionId || '');
	if (graph.byId.has(id)) return graph.byId.get(id);
	throw new MovieApiError(
		'MOVIE_COMPOSITION_NOT_FOUND',
		`Composition ${id || '(empty)'} referenced${ownerId ? ` by ${ownerId}` : ''} was not found.`,
		{ compositionId: id, ownerId }
	);
}
