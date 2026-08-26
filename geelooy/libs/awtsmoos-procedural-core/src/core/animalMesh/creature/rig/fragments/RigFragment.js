// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RigFragment.js
 * @description Defines one renderer-neutral local skeleton fragment that can live alone or merge into a greater Yetzirah rig.
 * RESPONSIBILITY: preserve bones, roots, constraints, controls, contacts, sockets, retargeting, and semantic ownership as one immutable anatomical vessel.
 * NON-RESPONSIBILITY: this file does not generate anatomy, transform bones into creature space, or evaluate animation time.
 * The Awtsmoos lets one limb contain a complete hidden order before a torso ever appears in sight;
 * Awtsmoos.com keeps every local bone and socket named, so fragments may unite without losing the truth of their own light.
 */

/**
 * Creates one immutable rig-fragment contract.
 * @param {object} input Fragment identity, local bones, controls, sockets, and metadata.
 * @returns {object} Frozen rig fragment suitable for detached preview or later merge.
 */
export function createRigFragment(input = {}) {
	const bones = [...(input.bones || [])];
	const rootBoneIds = input.rootBoneIds?.length
		? [...input.rootBoneIds]
		: bones.filter((bone) => !bone.parentBoneId).map((bone) => bone.id);
	return Object.freeze({
		bones: Object.freeze(bones),
		constraints: Object.freeze(
			input.constraints || bones.map((bone) => ({
				boneId: bone.id,
				...bone.jointConstraints
			}))
		),
		contactTargets: Object.freeze([...(input.contactTargets || [])]),
		controlGraph: Object.freeze([...(input.controlGraph || [])]),
		id: String(input.id || "rig-fragment"),
		metadata: Object.freeze({ ...(input.metadata || {}) }),
		retargetingMetadata: Object.freeze({
			...(input.retargetingMetadata || {}),
			semanticRoles: Object.freeze([
				...new Set(bones.map((bone) => bone.retargetingRole))
			])
		}),
		rootBoneIds: Object.freeze(rootBoneIds),
		sockets: Object.freeze([...(input.sockets || [])]),
		sourceAnatomyId: String(input.sourceAnatomyId || input.id || "fragment"),
		type: "yetzirah-rig-fragment",
		version: "1.0.0"
	});
}

/**
 * Reports whether one value satisfies the minimal rig-fragment contract.
 * @param {object} value Candidate value.
 * @returns {boolean} True when the fragment has stable identity and a bone array.
 */
export function isRigFragment(value) {
	return Boolean(
		value
		&& value.type === "yetzirah-rig-fragment"
		&& typeof value.id === "string"
		&& Array.isArray(value.bones)
	);
}
