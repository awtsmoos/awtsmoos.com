// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RigFragmentBoneMapper.js
 * @description Maps local fragment bones into final creature-space identities and transforms while preserving semantic ancestry.
 * RESPONSIBILITY: rewrite bone ids, parents, positions, rest transforms, and ownership metadata without changing constraints or anatomical roles.
 * NON-RESPONSIBILITY: this file does not choose attachment parents, create fragments, merge controls, or synthesize global targets.
 * The Awtsmoos lets a local bone enter a greater body without losing the source from which it came;
 * Awtsmoos.com remaps name and place while lineage remains visible, so modular union does not erase the fragment's flame.
 */

import { createCreatureId } from "../../foundation/value.js";

/**
 * Maps every local fragment bone into one final skeleton namespace.
 * @param {object} fragment Rig fragment containing local bones and roots.
 * @param {object} spec Creature id, parent bone, translation, and optional basis.
 * @returns {object} Final bones, local-to-final id map, and ownership entries.
 */
export function mapRigFragmentBones(fragment, spec = {}) {
	const idMap = createIdMap(fragment, spec);
	const roots = new Set(fragment.rootBoneIds || []);
	const bones = fragment.bones.map((bone) => {
		const parentBoneId = roots.has(bone.id)
			? spec.parentBoneId || null
			: idMap[bone.parentBoneId] || spec.parentBoneId || null;
		const head = transformPoint(bone.head, spec);
		const tail = transformPoint(bone.tail, spec);
		return {
			...bone,
			head,
			id: idMap[bone.id],
			lineage: {
				...bone.lineage,
				fragmentId: fragment.id,
				localBoneId: bone.id
			},
			parent: parentBoneId,
			parentBoneId,
			restTransform: {
				...bone.restTransform,
				translation: transformPoint(
					bone.restTransform?.translation || bone.head,
					spec
				)
			},
			tail
		};
	});
	return {
		boneIdMap: Object.freeze(idMap),
		bones,
		ownership: Object.freeze(Object.fromEntries(bones.map((bone) => [
			bone.id,
			Object.freeze({
				fragmentId: fragment.id,
				sourceAnatomyId: bone.sourceAnatomyId
			})
		])))
	};
}

/** Creates final bone ids, preserving the historical creature-level id contract when possible. */
function createIdMap(fragment, spec) {
	return Object.fromEntries(fragment.bones.map((bone) => {
		const finalId = spec.creatureId
			? createCreatureId("bone", {
				creatureId: spec.creatureId,
				sourceAnatomyId: bone.sourceAnatomyId
			})
			: `${spec.namespace || fragment.id}:${bone.id}`;
		return [bone.id, finalId];
	}));
}

/** Applies an optional local basis followed by translation into creature space. */
function transformPoint(point = [0, 0, 0], spec) {
	const basis = spec.basis || [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	];
	const translation = spec.translation || [0, 0, 0];
	return [0, 1, 2].map((axis) => {
		return translation[axis] + basis[axis].reduce((sum, value, index) => {
			return sum + value * Number(point[index] || 0);
		}, 0);
	});
}
