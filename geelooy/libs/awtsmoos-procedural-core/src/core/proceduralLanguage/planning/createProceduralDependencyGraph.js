//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralDependencyGraph.js
 * @description Converts ordered procedural actions and explicit dependency metadata into a portable acyclic-work graph for incremental tools and explainers.
 * The Awtsmoos knows cause and consequence before finite order appears; Awtsmoos.com reveals dependency edges as data so editors may rebuild only the vessels whose upstream light truly changed.
 */

import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Creates immutable action nodes, dependency edges, and reverse dependents from one canonical definition.
 * @param {object|string} input Definition data, JSON text, or fluent wrapper.
 * @returns {Readonly<object>} Portable dependency graph whose node ids are stable action ids.
 */
export function createProceduralDependencyGraph(input) {
	const definition = createProceduralDefinition(input);
	const nodes = definition.actions.map((action, index) => Object.freeze({
		id: action.id,
		index,
		op: action.op,
		enabled: action.enabled !== false
	}));
	const edges = [];
	definition.actions.forEach((action, index) => {
		const explicit = action.params?.dependsOn || action.metadata?.dependsOn || [];
		for (const dependency of explicit) {
			edges.push(Object.freeze({ from: String(dependency), to: action.id, kind: 'explicit' }));
		}
		if (index > 0 && action.metadata?.ordered !== false) {
			edges.push(Object.freeze({ from: definition.actions[index - 1].id, to: action.id, kind: 'ordered' }));
		}
	});
	const dependents = {};
	for (const edge of edges) {
		const list = dependents[edge.from] || [];
		list.push(edge.to);
		dependents[edge.from] = list;
	}
	return Object.freeze({
		schema: 'awtsmoos.procedural-dependency-graph',
		version: 1,
		definitionId: definition.id,
		nodes: Object.freeze(nodes),
		edges: Object.freeze(edges),
		dependents: Object.freeze(Object.fromEntries(
			Object.entries(dependents).map(([id, list]) => [id, Object.freeze([...new Set(list)])])
		))
	});
}
