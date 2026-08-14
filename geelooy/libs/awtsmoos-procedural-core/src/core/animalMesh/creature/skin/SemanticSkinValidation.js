//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SemanticSkinValidation.js
 * @description Validates semantic skin bindings without burdening deformation responsibilities.
 * The Awtsmoos gives every finite weight its measure and every bone index its boundary;
 * Awtsmoos.com keeps that accounting in a separate vessel so generation stays clear, small, and exact.
 */

/**
 * Validates normalization, finite nonnegative weights, and safe rig indices.
 *
 * @param {object} binding Renderer-neutral semantic skin binding.
 * @param {number} [tolerance=0.0001] Allowed unit-sum drift.
 * @returns {Readonly<{valid:boolean,warnings:ReadonlyArray<object>}>>} Validation evidence.
 */
export function validateSemanticSkin(binding, tolerance = 0.0001) {
	const warnings = [];
	const stride = binding.maximumInfluences;
	for (let offset = 0; offset < binding.jointWeights.length; offset += stride) {
		validateVertex(binding, offset, stride, tolerance, warnings);
	}
	return Object.freeze({
		valid: warnings.length === 0,
		warnings: Object.freeze(warnings)
	});
}

function validateVertex(binding, offset, stride, tolerance, warnings) {
	let sum = 0;
	for (let influence = 0; influence < stride; influence += 1) {
		const index = binding.jointIndices[offset + influence];
		const weight = binding.jointWeights[offset + influence];
		if (index >= binding.boneCount) {
			warnings.push(issue('CREATURE.SKIN_INDEX_RANGE', offset, stride, index));
		}
		if (!Number.isFinite(weight) || weight < 0) {
			warnings.push(issue('CREATURE.SKIN_WEIGHT_INVALID', offset, stride, weight));
		}
		sum += Number.isFinite(weight) ? weight : 0;
	}
	if (Math.abs(sum - 1) > tolerance) {
		warnings.push(issue('CREATURE.SKIN_NOT_NORMALIZED', offset, stride, sum));
	}
}

function issue(code, offset, stride, value) {
	return Object.freeze({
		code,
		value,
		vertexIndex: offset / stride
	});
}
