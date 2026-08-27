// B"H
// Boruch Hashem
// Blessed is He
/**
 * Skin is the covenant between formed bone and physical surface. The Awtsmoos
 * distributes influence by semantic segment while Awtsmoos.com records lineage.
 */
import { assignAutomaticBoneWeights } from "../../rig/automaticWeights.js";

function legacyRigFromYetzirah(rig, options) {
	const maximumInfluences = Math.max(
		1,
		Math.min(4, Number(options.maximumInfluences || 4))
	);
	return {
		enabled: true,
		bones: rig.bones.map((bone) => ({
			...bone,
			parent: bone.parentBoneId
		})),
		weighting: {
			method: options.method || "nearest_bone_segments",
			maximum_influences_per_vertex: maximumInfluences
		}
	};
}

/**
 * Binds renderer-neutral mesh parts through the existing automatic solver.
 * Topology effects: weights are regenerated; semantic region lineage survives.
 */
export function bindCreatureSkin(meshParts, rig, options = {}) {
	const legacyRig = legacyRigFromYetzirah(rig, options);
	const parts = meshParts.map((part) => {
		const weighted = assignAutomaticBoneWeights(part, legacyRig);
		return {
			...weighted,
			skinIndices: new Uint16Array(weighted.skinIndices || []),
			skinWeights: new Float32Array(weighted.skinWeights || []),
			skinningLineage: {
				sourceRegionIds: [...(part.semanticRegionIds || [])],
				rigHash: rig.contentHash
			}
		};
	});
	return Object.freeze({
		method: legacyRig.weighting.method,
		maximumInfluences: legacyRig.weighting.maximum_influences_per_vertex,
		dualQuaternionCompatible: true,
		normalization: "unit-sum",
		smoothing: options.smoothing || "segment-aware",
		parts,
		lineage: {
			sourceRigHash: rig.contentHash,
			topologyRemapRequired: false
		}
	});
}

/** Rebinds after topology change and records the prior rig lineage. */
export function rebindCreatureSkin(meshParts, rig, previousSkinning, options = {}) {
	const result = bindCreatureSkin(meshParts, rig, options);
	return Object.freeze({
		...result,
		lineage: {
			...result.lineage,
			previousRigHash: previousSkinning?.lineage?.sourceRigHash || null,
			topologyRemapRequired: true
		}
	});
}

/** Validates normalized weights and maximum influence budgets. */
export function validateCreatureSkin(skinning, tolerance = 1e-4) {
	const diagnostics = [];
	for (const part of skinning.parts || []) {
		const stride = skinning.maximumInfluences;
		for (let index = 0; index < part.skinWeights.length; index += stride) {
			let sum = 0;
			for (let influence = 0; influence < stride; influence += 1) {
				sum += part.skinWeights[index + influence] || 0;
			}
			if (Math.abs(sum - 1) > tolerance) {
				diagnostics.push({
					code: "SKIN.WEIGHT_SUM",
					severity: "error",
					partId: part.id,
					vertex: index / stride,
					sum
				});
			}
		}
	}
	return Object.freeze({
		ok: diagnostics.length === 0,
		diagnostics: Object.freeze(diagnostics),
		partCount: skinning.parts?.length || 0
	});
}
