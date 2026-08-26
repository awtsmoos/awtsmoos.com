// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RigFragmentControlMapper.js
 * @description Remaps local fragment controls, contacts, and sockets onto final merged bone identities.
 * RESPONSIBILITY: preserve independently authored IK, pole, contact, and socket semantics after skeleton flattening.
 * NON-RESPONSIBILITY: this file does not create bones, choose phases, solve constraints, or evaluate motion.
 * The Awtsmoos lets a local control keep its intention even when the bone beneath it receives another name;
 * Awtsmoos.com carries every target through the merge so detached and embodied animation may remain the same flame.
 */

/**
 * Remaps one fragment's local control references into final bone ids.
 * @param {object} fragment Source rig fragment.
 * @param {object} boneIdMap Local-to-final bone id map.
 * @returns {object} Remapped controls, contacts, and sockets.
 */
export function mapRigFragmentControls(fragment, boneIdMap) {
	return {
		contactTargets: (fragment.contactTargets || []).map((target) => {
			return remapRecord(target, boneIdMap);
		}),
		controlGraph: (fragment.controlGraph || []).map((control) => {
			return remapRecord(control, boneIdMap);
		}),
		sockets: (fragment.sockets || []).map((socket) => {
			return remapRecord(socket, boneIdMap);
		})
	};
}

/** Rewrites the common bone-reference fields while preserving arbitrary metadata. */
function remapRecord(record, boneIdMap) {
	const output = { ...record };
	for (const key of ["boneId", "targetBoneId", "parentBoneId"]) {
		if (output[key] && boneIdMap[output[key]]) {
			output[key] = boneIdMap[output[key]];
		}
	}
	return Object.freeze(output);
}
