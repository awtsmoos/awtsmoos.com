// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LimbRigControls.js
 * @description Derives detached-limb contact, IK, pole, and socket controls from one local limb bone chain.
 * RESPONSIBILITY: make a standalone leg, arm, wing, fin, or tentacle immediately controllable without requiring a parent creature.
 * NON-RESPONSIBILITY: this file does not create bones, merge rigs, solve IK, or evaluate animation clips.
 * The Awtsmoos lets one limb know its root, reach, bend, and contact even while standing alone;
 * Awtsmoos.com preserves those local promises so the same part may later enter a creature without forgetting its own throne.
 */

/**
 * Creates local controls and sockets for one standalone limb fragment.
 * @param {object} limb Semantic limb anatomy.
 * @param {Array<object>} bones Local limb bones in proximal-to-distal order.
 * @returns {object} Contact targets, control graph, and attachment sockets.
 */
export function createLimbRigControls(limb, bones) {
	const firstBone = bones[0];
	const endBone = bones.at(-1);
	if (!firstBone || !endBone) {
		return emptyControls();
	}
	const contactTargets = limb.contactCapabilities?.length
		? [createContactTarget(limb, endBone)]
		: [];
	const controlGraph = [
		{
			id: `fragment.ik:${limb.id}`,
			limbId: limb.id,
			targetBoneId: endBone.id,
			type: "ik"
		}
	];
	if (bones.length > 1) {
		controlGraph.push({
			direction: [...limb.segments[0].preferredBendDirection],
			id: `fragment.pole:${limb.id}`,
			limbId: limb.id,
			targetBoneId: firstBone.id,
			type: "pole"
		});
	}
	return {
		contactTargets,
		controlGraph,
		sockets: [
			createSocket(`${limb.id}.root`, firstBone.id, firstBone.head, "root"),
			createSocket(`${limb.id}.end`, endBone.id, endBone.tail, "endpoint")
		]
	};
}

/** Creates one semantic contact target at the distal limb endpoint. */
function createContactTarget(limb, endBone) {
	return {
		boneId: endBone.id,
		capabilities: [...limb.contactCapabilities],
		id: `fragment.contact:${limb.id}`,
		limbId: limb.id,
		restPosition: [...endBone.tail],
		role: limb.functionalRole
	};
}

/** Creates one reusable fragment attachment socket. */
function createSocket(id, boneId, position, role) {
	return {
		boneId,
		id,
		position: [...position],
		role,
		type: "rig-fragment-socket"
	};
}

/** Returns an empty control contract for malformed or intentionally boneless limbs. */
function emptyControls() {
	return {
		contactTargets: [],
		controlGraph: [],
		sockets: []
	};
}
