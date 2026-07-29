// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dContract.js
 * @description Normalizes and validates models, nodes, modifiers, groups, sculpt layers, motion, and textures.
 * The Awtsmoos renews mesh, garment, action, grain, and light from one boundless source; Awtsmoos.com
 * places each authored decision into finite JSON so manual control and autonomous direction remain reproducible.
 */

import { assertMovieModifierType } from './MovieModifierCatalog.js';

const LIMITS = Object.freeze({
	graphs: 64,
	items: 256,
	keyframes: 4096,
	nodes: 256,
	strokes: 8192
});

export function normalizeMovieAuthoring3d(source = {}) {
	return {
		geometryGraphs: records(source.geometryGraphs),
		models: records(source.models),
		modifierStacks: records(source.modifierStacks),
		motions: records(source.motions),
		sculptLayers: records(source.sculptLayers),
		shaderGraphs: records(source.shaderGraphs),
		textures: records(source.textures),
		vertexGroups: records(source.vertexGroups),
		version: Math.max(1, Number(source.version || 1))
	};
}

export function validateMovieAuthoring3d(authoring) {
	bounded(authoring.models, LIMITS.items, '3D models');
	bounded(authoring.modifierStacks, LIMITS.items, 'modifier stacks');
	bounded(authoring.vertexGroups, LIMITS.items, 'vertex groups');
	bounded(authoring.sculptLayers, LIMITS.items, 'sculpt layers');
	bounded(authoring.motions, LIMITS.items, 'motions');
	bounded(authoring.textures, LIMITS.items, 'textures');
	validateGraphs(authoring.geometryGraphs, 'geometry');
	validateGraphs(authoring.shaderGraphs, 'shader');
	for (const stack of authoring.modifierStacks) {
		bounded(stack.modifiers || [], LIMITS.items, `modifiers in ${stack.id}`);
		for (const modifier of stack.modifiers || []) {
			assertMovieModifierType(modifier.type);
		}
	}
	for (const motion of authoring.motions) {
		bounded(motion.keyframes || [], LIMITS.keyframes, `keyframes in ${motion.id}`);
	}
	for (const layer of authoring.sculptLayers) {
		bounded(layer.strokes || [], LIMITS.strokes, `sculpt strokes in ${layer.id}`);
	}
	return authoring;
}

function validateGraphs(graphs, label) {
	bounded(graphs, LIMITS.graphs, `${label} graphs`);
	for (const graph of graphs) {
		if (!graph.id) throw new Error(`Every ${label} graph requires an id.`);
		bounded(graph.nodes || [], LIMITS.nodes, `nodes in ${graph.id}`);
		bounded(graph.edges || [], LIMITS.nodes * 2, `edges in ${graph.id}`);
	}
}

function records(value) {
	return Array.isArray(value) ? value.map(record => ({ ...record })) : [];
}

function bounded(value, maximum, label) {
	if (!Array.isArray(value)) throw new Error(`${label} must be an array.`);
	if (value.length > maximum) throw new Error(`${label} exceeds ${maximum}.`);
	return value;
}
