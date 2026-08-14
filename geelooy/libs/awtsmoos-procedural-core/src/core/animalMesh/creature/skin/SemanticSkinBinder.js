// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SemanticSkinBinder.js
 * @description Orchestrates anatomy-first candidates, typed semantic weights, lineage, and post-bind quality evidence.
 * The Awtsmoos lets each finite surface remember its source before distance is allowed to speak;
 * Awtsmoos.com keeps orchestration separate from weighting so Creator skinning stays readable, deterministic, and renderer-neutral.
 */

import { createCreatureId, hashCreatureValue } from '../foundation/value.js';
import { selectSkinInfluenceCandidates } from './SkinInfluencePolicy.js';
import { analyzeSemanticSkinQuality } from './SemanticSkinQuality.js';
import { createSemanticSkinWeights } from './SemanticSkinWeighting.js';

export { validateSemanticSkin } from './SemanticSkinValidation.js';

/** Binds deterministic semantic weights while preserving the typed-array renderer contract. */
export function bindSemanticSkin(mesh, rig, options = {}) {
	const maximumInfluences = clampInfluenceCount(options.maximumInfluences);
	const candidates = selectSkinInfluenceCandidates(mesh, rig);
	const weighted = createSemanticSkinWeights(
		mesh.positions,
		candidates,
		maximumInfluences,
		options
	);
	const content = createBindingContent(mesh, rig, maximumInfluences);
	const binding = createBinding(
		content,
		weighted,
		candidates,
		mesh,
		rig
	);
	binding.quality = analyzeSemanticSkinQuality(binding);
	return Object.freeze(binding);
}

function createBindingContent(mesh, rig, maximumInfluences) {
	return {
		maximumInfluences,
		sourceMeshHash: mesh.contentHash || null,
		sourceMeshId: mesh.id || null,
		sourceRigHash: rig.contentHash
	};
}

function createBinding(content, weighted, candidates, mesh, rig) {
	return {
		boneCount: rig.bones.length,
		contentHash: hashCreatureValue(content),
		coverage: createCoverage(candidates, mesh),
		dualQuaternionCompatible: true,
		id: createCreatureId('skin-binding', content),
		jointIndices: weighted.jointIndices,
		jointWeights: weighted.jointWeights,
		maximumInfluences: content.maximumInfluences,
		sourceMeshHash: mesh.contentHash || null,
		sourceRigHash: rig.contentHash,
		type: 'semantic-skin-binding',
		version: '2.2.0',
		weightingAdapter: 'semantic-capsule-hierarchy'
	};
}

function createCoverage(candidates, mesh) {
	return Object.freeze({
		candidateCount: candidates.length,
		fallbackUsed: candidates.every(entry => entry.relationship === 'fallback'),
		semanticRegionCount: mesh.semanticRegionIds?.length || 0
	});
}

function clampInfluenceCount(value) {
	return Math.max(1, Math.min(8, Number(value || 4)));
}
