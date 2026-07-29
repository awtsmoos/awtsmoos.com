// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dDirector.js
 * @description Applies authored models, geometry, motion, sculpt, modifiers, textures, and shaders before every frame.
 * The Awtsmoos renews geometry and gesture before the canvas receives their trace; Awtsmoos.com
 * coordinates one private runtime director while public JSON remains immutable and serializable.
 */

import { applyMovieGeometryGraph } from './MovieAuthoring3dGeometryGraphRuntime.js';
import { applyMovieAuthoring3dMotion } from './MovieAuthoring3dMotion.js';
import { applyMovieModifierStack } from './MovieAuthoring3dModifierRuntime.js';
import { applyMovieSculptLayers } from './MovieAuthoring3dSculptRuntime.js';
import { applyMovieShaderGraph } from './MovieAuthoring3dShaderRuntime.js';
import { resolveMovieAuthoring3dTarget } from './MovieAuthoring3dTargets.js';

export class MovieAuthoring3dDirector {
	constructor(runtime, authoring3d = {}) {
		this.runtime = runtime;
		this.authoring3d = authoring3d;
		this.lastFrame = [];
	}

	apply(time) {
		const output = [];
		for (const model of this.authoring3d.models || []) {
			const target = resolveMovieAuthoring3dTarget(this.runtime, model);
			if (!target) {
				output.push({ id: model.id, status: 'target-missing' });
				continue;
			}
			const motion = findById(this.authoring3d.motions, model.motionId);
			const stack = findById(this.authoring3d.modifierStacks, model.modifierStackId);
			const shader = findById(this.authoring3d.shaderGraphs, model.shaderGraphId);
			const geometry = findGeometryGraph(this.authoring3d.geometryGraphs, model);
			const sculptLayers = (this.authoring3d.sculptLayers || []).filter(layer => !layer.target || layer.target === model.id);
			output.push({
				geometry: applyMovieGeometryGraph(target, geometry),
				id: model.id,
				modifiers: applyMovieModifierStack(this.runtime, target, stack, time),
				motion: applyMovieAuthoring3dMotion(this.runtime, target, motion, time),
				sculpt: applyMovieSculptLayers(target, sculptLayers, this.authoring3d.vertexGroups),
				shader: applyMovieShaderGraph(target, shader, time, this.authoring3d.textures),
				status: 'applied'
			});
		}
		this.lastFrame = output;
		return output;
	}

	snapshot() {
		return this.lastFrame.map(record => ({ ...record }));
	}

	destroy() {
		this.lastFrame = [];
	}
}

function findById(records = [], id) {
	return records.find(record => record.id === id) || null;
}

function findGeometryGraph(records = [], model) {
	return findById(records, model.geometryGraphId)
		|| records.find(graph => graph.nodes?.some(node => node.modelId === model.id))
		|| null;
}
