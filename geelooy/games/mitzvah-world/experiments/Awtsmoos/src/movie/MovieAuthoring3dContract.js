// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dContract.js
 * @description Normalizes and validates models, nodes, modifiers, groups, sculpt, motion, textures, and manual edits.
 * The Awtsmoos renews mesh, garment, action, point, grain, and light from one boundless source;
 * Awtsmoos.com places each authored decision into finite JSON so manual and autonomous direction remain reproducible.
 */

import { assertMovieModifierType } from './MovieModifierCatalog.js';

const LIMITS = Object.freeze({
	graphs: 64,
	items: 256,
	keyframes: 4096,
	nodes: 256,
	strokes: 8192,
	vertexEdits: 65536
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
	for (const model of authoring.models) validateModel(model);
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

function validateModel(model) {
	bounded(model.vertexEdits || [], LIMITS.vertexEdits, `vertex edits in ${model.id}`);
	for (const edit of model.vertexEdits || []) {
		vector(edit.value, `vertex ${edit.index} in ${model.id}`);
	}
	const transform = model.manualTransform;
	if (!transform) return;
	vector(transform.position, `position in ${model.id}`);
	vector(transform.rotation, `rotation in ${model.id}`);
	vector(transform.scale, `scale in ${model.id}`);
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

function vector(value, label) {
	if (!Array.isArray(value) || value.length !== 3 || value.some(item => !Number.isFinite(Number(item)))) {
		throw new Error(`${label} must contain three finite numbers.`);
	}
}
