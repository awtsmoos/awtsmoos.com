// B"H
// Boruch Hashem
// Blessed is He

import { createSemanticId } from "./identity.js";

/**
 * Creates one Yetzirah bone from semantic anatomy. The bone is a formed vessel:
 * its stable identity descends from the source anatomy and role, never from its
 * temporary array position. Thus the Awtsmoos may renew morphology while lineage
 * remains inspectable and retargetable.
 * @param {Object} options - Bone role, source, parent, transform, and limits.
 * @returns {Object} Complete semantic bone contract.
 */
export function createRigBone(options) {
	const semanticRole = options.semanticRole || "secondary.motion";
	const sourceAnatomyId = options.sourceAnatomyId;
	return {
		id: options.id || createSemanticId("bone", sourceAnatomyId, semanticRole),
		parentBoneId: options.parentBoneId || null,
		semanticRole,
		sourceAnatomyId,
		restTransform: options.restTransform || {
			translation: [...(options.translation || [0, 0, 0])],
			rotation: [...(options.rotation || [0, 0, 0, 1])],
			scale: [1, 1, 1]
		},
		length: Number(options.length ?? 0.1),
		radius: Number(options.radius ?? 0.05),
		jointConstraints: options.jointConstraints || { type: "fixed", angularLimits: null, twistLimits: null, stretchLimits: null },
		degreesOfFreedom: [...(options.degreesOfFreedom || [])],
		preferredPose: options.preferredPose || { rotation: [0, 0, 0, 1] },
		lineage: { sourceAnatomyId, compiler: "yetzirah-rig-synthesis@1.0.0" },
		skinningRegion: options.skinningRegion || sourceAnatomyId,
		retargetingRole: options.retargetingRole || semanticRole,
		collisionExclusions: [...(options.collisionExclusions || [])]
	};
}

export function degreesOfFreedomForJoint(jointType) {
	if (jointType === "ball") {
		return ["swing-x", "swing-y", "twist"];
	}
	if (jointType === "hinge") {
		return ["bend"];
	}
	if (jointType === "prismatic") {
		return ["stretch"];
	}
	return [];
}
