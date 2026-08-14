// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatureSkinning.js
 * @description Adapts canonical semantic bindings and quality evidence into the stable multi-part Creator contract.
 * The Awtsmoos joins every generated surface to its Yetzirah lineage; Awtsmoos.com keeps four-influence renderer vessels,
 * exact normalization, topology lineage, and measurable binding quality while distant limbs remain outside another limb's flesh.
 */

import {
	bindSemanticSkin,
	validateSemanticSkin
} from './SemanticSkinBinder.js';

/** Binds every renderer-neutral mesh part through one canonical semantic capsule solver. */
export function bindCreatureSkin(meshParts, rig, options = {}) {
	const maximumInfluences = Math.max(1, Math.min(4, Number(options.maximumInfluences || 4)));
	const parts = meshParts.map(part => bindPart(part, rig, maximumInfluences, options));
	return Object.freeze({
		boneCount: rig.bones.length,
		dualQuaternionCompatible: true,
		lineage: Object.freeze({
			sourceRigHash: rig.contentHash,
			topologyRemapRequired: false
		}),
		maximumInfluences,
		method: 'semantic-capsule-hierarchy',
		normalization: 'unit-sum',
		parts: Object.freeze(parts),
		smoothing: options.smoothing || 'hierarchy-continuous'
	});
}

/** Rebinds after topology change while preserving previous rig identity for remap diagnostics. */
export function rebindCreatureSkin(meshParts, rig, previousSkinning, options = {}) {
	const result = bindCreatureSkin(meshParts, rig, options);
	return Object.freeze({
		...result,
		lineage: Object.freeze({
			...result.lineage,
			previousRigHash: previousSkinning?.lineage?.sourceRigHash || null,
			topologyRemapRequired: true
		})
	});
}

/** Validates normalized finite weights, maximum influence budgets, and safe joint indices. */
export function validateCreatureSkin(skinning, tolerance = 1e-4) {
	const diagnostics = [];
	for (const part of skinning.parts || []) {
		diagnostics.push(...validatePart(part, skinning, tolerance));
	}
	return Object.freeze({
		diagnostics: Object.freeze(diagnostics),
		ok: diagnostics.length === 0,
		partCount: skinning.parts?.length || 0
	});
}

function bindPart(part, rig, maximumInfluences, options) {
	const binding = bindSemanticSkin(part, rig, {
		falloff: options.falloff,
		maximumInfluences,
		quality: options.quality || options.skinQuality || 'balanced'
	});
	const validation = validateSemanticSkin(binding);
	return Object.freeze({
		...part,
		skinIndices: binding.jointIndices,
		skinWeights: binding.jointWeights,
		skinningBindingId: binding.id,
		skinningDiagnostics: Object.freeze({
			...binding.coverage,
			quality: binding.quality,
			valid: validation.valid,
			warningCount: validation.warnings.length
		}),
		skinningLineage: Object.freeze({
			rigHash: rig.contentHash,
			sourceRegionIds: Object.freeze([...(part.semanticRegionIds || [])]),
			weightingAdapter: binding.weightingAdapter
		})
	});
}

function validatePart(part, skinning, tolerance) {
	const diagnostics = [];
	const stride = skinning.maximumInfluences;
	for (let offset = 0; offset < part.skinWeights.length; offset += stride) {
		let sum = 0;
		for (let influence = 0; influence < stride; influence += 1) {
			const weight = part.skinWeights[offset + influence];
			const joint = part.skinIndices[offset + influence];
			if (!Number.isFinite(weight) || weight < 0) diagnostics.push(issue('SKIN.WEIGHT_INVALID', part.id, offset, stride, weight));
			if (joint >= skinning.boneCount) diagnostics.push(issue('SKIN.JOINT_RANGE', part.id, offset, stride, joint));
			sum += Number.isFinite(weight) ? weight : 0;
		}
		if (Math.abs(sum - 1) > tolerance) diagnostics.push(issue('SKIN.WEIGHT_SUM', part.id, offset, stride, sum));
	}
	return diagnostics;
}

function issue(code, partId, offset, stride, value) {
	return Object.freeze({ code, partId, severity: 'error', value, vertex: offset / stride });
}
