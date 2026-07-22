// B"H
// Boruch Hashem
// Blessed is He

import { cloneCreatureValue } from "./clone.js";
import { normalizeSkinWeights } from "./skinCompiler.js";

/**
 * Smooths influences across neighboring vertices while retaining a bounded
 * maximum-influence vessel. The operation is deterministic and suitable for
 * adapters that later replace linear adjacency with geodesic or voxel neighborhoods.
 * @param {Object} skin - Skin-weight artifact.
 * @param {Object} [options] - Iterations and smoothing strength.
 * @returns {Object} Smoothed, normalized skin artifact.
 */
export function smoothSkinWeights(skin, options = {}) {
	let current = cloneCreatureValue(skin);
	const vertexCount = current.jointWeights.length / current.maximumInfluences;
	const strength = Math.max(0, Math.min(1, Number(options.strength ?? 0.35)));
	for (let iteration = 0; iteration < Math.max(1, Number(options.iterations || 1)); iteration += 1) {
		const nextWeights = new Float32Array(current.jointWeights);
		for (let vertex = 0; vertex < vertexCount; vertex += 1) {
			for (let influence = 0; influence < current.maximumInfluences; influence += 1) {
				const index = vertex * current.maximumInfluences + influence;
				const previous = vertex ? current.jointWeights[index - current.maximumInfluences] : current.jointWeights[index];
				const following = vertex + 1 < vertexCount ? current.jointWeights[index + current.maximumInfluences] : current.jointWeights[index];
				const neighborhood = (previous + current.jointWeights[index] + following) / 3;
				nextWeights[index] = current.jointWeights[index] * (1 - strength) + neighborhood * strength;
			}
		}
		current.jointWeights = nextWeights;
		current = normalizeSkinWeights(current);
	}
	current.diagnostics = { ...current.diagnostics, smoothed: true, smoothingStrength: strength };
	return current;
}
