// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dDirector.js
 * @description Applies models, textures, geometry, motion, sculpt, modifiers, shaders, and durable manual edits.
 * The Awtsmoos renews geometry and garment before the canvas receives their trace; Awtsmoos.com
 * coordinates authored automation and persistent object/edit-mode decisions without splitting project truth.
 */

import { applyMovieGeometryGraph } from './MovieAuthoring3dGeometryGraphRuntime.js';
import { applyMovieAuthoring3dMotion } from './MovieAuthoring3dMotion.js';
import { applyMovieModifierStack } from './MovieAuthoring3dModifierRuntime.js';
import { applyMovieSculptLayers } from './MovieAuthoring3dSculptRuntime.js';
import { applyMovieShaderGraph } from './MovieAuthoring3dShaderRuntime.js';
import { resolveMovieAuthoring3dTarget } from './MovieAuthoring3dTargets.js';
import { MovieAuthoring3dTextureRuntime } from './MovieAuthoring3dTextureRuntime.js';
import { applyMovieScene3dAuthoring } from './MovieScene3dAuthoringRuntime.js';

export class MovieAuthoring3dDirector {
	constructor(runtime, authoring3d = {}, dependencies = {}) {
		this.runtime = runtime;
		this.authoring3d = authoring3d;
		this.lastFrame = [];
		this.textures = new MovieAuthoring3dTextureRuntime(
			authoring3d.textures,
			dependencies.textures
		);
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
			const sculptLayers = (this.authoring3d.sculptLayers || []).filter(
				layer => !layer.target || layer.target === model.id
			);
			const geometryEvidence = applyMovieGeometryGraph(target, geometry);
			const modifiers = applyMovieModifierStack(this.runtime, target, stack, time);
			const motionEvidence = applyMovieAuthoring3dMotion(this.runtime, target, motion, time);
			const sculpt = applyMovieSculptLayers(
				target,
				sculptLayers,
				this.authoring3d.vertexGroups
			);
			const manual = applyMovieScene3dAuthoring(target, model);
			const shaderEvidence = applyMovieShaderGraph(
				target,
				shader,
				time,
				this.authoring3d.textures,
				this.textures
			);
			output.push({
				geometry: geometryEvidence,
				id: model.id,
				manual,
				modifiers,
				motion: motionEvidence,
				sculpt,
				shader: shaderEvidence,
				status: 'applied'
			});
		}
		this.lastFrame = output;
		return output;
	}

	snapshot() {
		return this.lastFrame.map(record => ({ ...record }));
	}

	textureSnapshot() {
		return this.textures.snapshot();
	}

	destroy() {
		this.lastFrame = [];
		this.textures.destroy();
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
