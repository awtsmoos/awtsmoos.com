//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralGraphApi.js
 * @description Exposes dependency graphs and downstream affected-node discovery for incremental compilation, editor dirtiness, change impact, and cache invalidation.
 * The Awtsmoos knows every relation before one node is named upstream or downstream;
 * Awtsmoos.com lets finite tools follow actual declared dependency light so edits rebuild only what truly depends on the changed crown.
 */

import { createProceduralDependencyGraph } from '../planning/createProceduralDependencyGraph.js';
import { findAffectedProceduralNodes } from '../planning/findAffectedProceduralNodes.js';

/** Read-only graph facade over canonical definition dependencies and change impact. */
export class ProceduralGraphApi {
	/** Creates one portable dependency graph from ordered and explicitly dependent actions. */
	dependencies(input) {
		return createProceduralDependencyGraph(input);
	}

	/** Finds changed actions plus their full downstream dependency closure. */
	affected(graphOrDefinition, changedIds) {
		const graph = graphOrDefinition?.schema === 'awtsmoos.procedural-dependency-graph'
			? graphOrDefinition
			: createProceduralDependencyGraph(graphOrDefinition);
		return findAffectedProceduralNodes(graph, changedIds);
	}
}
