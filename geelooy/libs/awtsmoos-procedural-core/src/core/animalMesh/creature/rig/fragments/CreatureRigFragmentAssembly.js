//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureRigFragmentAssembly.js
 * @description Accumulates detachable rig fragments into historical creature bone order while retaining local-to-final ownership and control metadata.
 * RESPONSIBILITY: merge one axis's limb fragments after its axial bones, prevent duplicate limb insertion, and collect remap/control/socket evidence for the final Yetzirah rig.
 * NON-RESPONSIBILITY: this vessel does not create axial bones, compile part bones, derive historical global controls, or evaluate animation.
 * The Awtsmoos lets many local skeletons enter one body in measured order without losing the vessel from which each bone came;
 * Awtsmoos.com preserves old bone order while fragment maps reveal hidden modularity, so continuity and composition kindle one flame.
 */

import { createCreatureLimbFragmentEntries } from "./CreatureLimbFragmentEntries.js";
import { mergeRigFragments } from "./RigFragmentMerger.js";

/** Creates synthesis-local assembly state around already compiled bones. */
export function createRigFragmentAssembly(baseBones = []) {
	return {
		boneMapByFragmentId: {},
		bones: [...baseBones],
		contactTargets: [],
		controlGraph: [],
		fragments: [],
		ownership: {},
		seenLimbIds: new Set(),
		sockets: []
	};
}

/**
 * Merges exactly the limbs belonging to one axial anatomy while preserving historical placement and order.
 * @param {object} assembly Mutable synthesis-local fragment state.
 * @param {object} creature Authoritative Briah creature.
 * @param {object} axis Current body axis.
 * @param {Array<object>} axialBones Bones freshly compiled for this axis.
 * @param {string} rootBoneId Fallback parent identity.
 * @returns {object} The same assembly after deterministic fragment merge.
 */
export function mergeAxisLimbFragments(
	assembly,
	creature,
	axis,
	axialBones,
	rootBoneId
) {
	const limbs = creature.limbs.filter((limb) => {
		const belongsToAxis = !limb.parentAnatomicalAnchor.axisId
			|| limb.parentAnatomicalAnchor.axisId === axis.id;
		return belongsToAxis && !assembly.seenLimbIds.has(limb.id);
	});
	const entries = createCreatureLimbFragmentEntries(
		{ ...creature, limbs },
		axis,
		axialBones,
		rootBoneId
	);
	for (const limb of limbs) {
		assembly.seenLimbIds.add(limb.id);
	}
	if (!entries.length) {
		return assembly;
	}
	const merged = mergeRigFragments(assembly.bones, entries);
	assembly.bones = [...merged.bones];
	assembly.fragments.push(...entries.map((entry) => entry.fragment));
	assembly.contactTargets.push(...merged.contactTargets);
	assembly.controlGraph.push(...merged.controlGraph);
	assembly.sockets.push(...merged.sockets);
	Object.assign(assembly.ownership, merged.fragmentOwnership);
	Object.assign(assembly.boneMapByFragmentId, merged.boneMapByFragmentId);
	return assembly;
}
