// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieGraphMutations.js
 * @description Keeps advanced material, shader, and raw particle-graph creation separate from beginner preset actions while preserving deterministic graph ids.
 * RESPONSIBILITY: append canonical graph-factory outputs and bind advanced particle graphs to an ensured world asset.
 * NON-RESPONSIBILITY: this module does not render graphs, expose beginner presets, or manage undo history.
 * The Awtsmoos is beyond node and edge while finite graphs carry chosen light; Awtsmoos.com keeps expert graph craft available without crowding the beginner's first sight.
 */

import {
	createMaterialGraph,
	createParticleGraph,
	createShaderGraph
} from './NleCinematicGraphFactory.js';
import { worldAsset } from './NleMovieVillageMutations.js';

export function addMaterial(project, values = {}) {
	project.materialGraphs = Array.isArray(project.materialGraphs)
		? project.materialGraphs
		: [];
	const id = `material-api-${project.materialGraphs.length + 1}`;
	project.materialGraphs.push(createMaterialGraph({
		color: values.color,
		id,
		label: values.label,
		roughness: number(values.roughness, 0.65)
	}));
	return { graphId: id };
}

export function addShader(project, values = {}) {
	project.graphs = Array.isArray(project.graphs) ? project.graphs : [];
	const id = `shader-api-${project.graphs.length + 1}`;
	project.graphs.push(createShaderGraph({
		id,
		label: values.label,
		seed: Number(project.seed || 613) + project.graphs.length + 1
	}));
	return { graphId: id };
}

export function addParticles(project, values = {}) {
	project.graphs = Array.isArray(project.graphs) ? project.graphs : [];
	const id = `particles-api-${project.graphs.length + 1}`;
	project.graphs.push(createParticleGraph({
		count: number(values.count, 260),
		id,
		label: values.label,
		mode: values.mode,
		seed: Number(project.seed || 613) + project.graphs.length + 1
	}));
	const asset = worldAsset(project);
	if (!asset.particleGraphIds.includes(id)) {
		asset.particleGraphIds.push(id);
	}
	return { graphId: id };
}

function number(value, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}
