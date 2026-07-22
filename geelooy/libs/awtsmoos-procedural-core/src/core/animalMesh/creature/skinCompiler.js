// B"H
// Boruch Hashem
// Blessed is He
/**
 * Yetzirah bones meet Asiyah vertices through the existing automatic solver.
 * The Awtsmoos unites formation and surface; Awtsmoos.com derives segment heads
 * only as a compatibility frame, never as a second skeleton authority.
 */
import {
	bindCreatureSkin as bindExistingSkin,
	validateCreatureSkin
} from "./skin/creatureSkinning.js";

export function createPositionedCreatureRig(rig) {
	const positioned = new Map();
	const bones = rig.bones.map((bone) => {
		const parent = positioned.get(bone.parentBoneId);
		const translation = bone.restTransform?.translation || [0, 0, 0];
		const explicit = translation.some((value) => Math.abs(value) > 1e-9);
		const head = explicit ? [...translation] : [...(parent?.tail || [0, 0, 0])];
		const direction = bone.semanticRole.includes("support") ? [0, -1, 0] : [1, 0, 0];
		const tail = head.map((value, axis) => value + direction[axis] * Math.max(0.001, bone.length || 0.001));
		const next = { ...bone, head, tail };
		positioned.set(bone.id, next);
		return next;
	});
	return { ...rig, bones };
}

function flatten(parts, property, Constructor) {
	const values = [];
	for (const part of parts) {
		values.push(...part[property]);
	}
	return new Constructor(values);
}

export function normalizeSkinWeights(skin) {
	const stride = Math.max(1, Number(skin.maximumInfluences || 4));
	const weights = new Float32Array(skin.jointWeights || []);
	for (let index = 0; index < weights.length; index += stride) {
		let total = 0;
		for (let influence = 0; influence < stride; influence += 1) {
			total += weights[index + influence] || 0;
		}
		if (total <= 1e-9) {
			weights[index] = 1;
			continue;
		}
		for (let influence = 0; influence < stride; influence += 1) {
			weights[index + influence] /= total;
		}
	}
	return { ...skin, jointWeights: weights, normalization: "unit-sum" };
}

export function bindCreatureSkin(mesh, rig, options = {}) {
	const preparedRig = createPositionedCreatureRig(rig);
	const bound = bindExistingSkin(mesh.parts || [mesh], preparedRig, options);
	return normalizeSkinWeights({
		type: "creature-skin-weights",
		rigId: rig.id,
		maximumInfluences: bound.maximumInfluences,
		jointIndices: flatten(bound.parts, "skinIndices", Uint16Array),
		jointWeights: flatten(bound.parts, "skinWeights", Float32Array),
		parts: bound.parts,
		diagnostics: { generated: true, sourceRigHash: rig.contentHash }
	});
}

export function validateSkinWeights(skin, tolerance = 1e-4) {
	const report = validateCreatureSkin({
		maximumInfluences: skin.maximumInfluences,
		parts: skin.parts || []
	}, tolerance);
	return {
		valid: report.ok,
		errors: report.diagnostics,
		warnings: [],
		metrics: { parts: report.partCount, influences: skin.jointWeights?.length || 0 }
	};
}
