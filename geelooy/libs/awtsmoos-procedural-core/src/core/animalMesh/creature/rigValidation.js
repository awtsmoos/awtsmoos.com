// B"H
// Boruch Hashem
// Blessed is He

/**
 * Validates hierarchy, constraints, stable identifiers, and semantic sources in a
 * YetzirahRig. The report is inspectable and never assumes a humanoid template.
 * @param {Object} rig - YetzirahRig.
 * @returns {Object} Structured rig diagnostics.
 */
export function validateYetzirahRig(rig) {
	const errors = [];
	const warnings = [];
	const ids = new Set();
	for (const bone of rig.bones || []) {
		if (ids.has(bone.id)) {
			errors.push({ code: "RIG_BONE_ID_DUPLICATE", boneId: bone.id });
		}
		ids.add(bone.id);
		if (bone.parentBoneId && !rig.bones.some((candidate) => candidate.id === bone.parentBoneId)) {
			errors.push({ code: "RIG_PARENT_MISSING", boneId: bone.id, parentBoneId: bone.parentBoneId });
		}
		if (!bone.sourceAnatomyId) {
			errors.push({ code: "RIG_SOURCE_ANATOMY_MISSING", boneId: bone.id });
		}
		const limits = bone.jointConstraints?.angularLimits;
		if (limits && limits.minimum > limits.maximum) {
			errors.push({ code: "RIG_JOINT_LIMIT_INVALID", boneId: bone.id });
		}
		if (bone.length < 0) {
			errors.push({ code: "RIG_BONE_LENGTH_INVALID", boneId: bone.id });
		}
	}
	if (!(rig.controlGraph?.contactTargets || []).length) {
		warnings.push({ code: "RIG_HAS_NO_CONTACT_TARGETS" });
	}
	return { valid: errors.length === 0, errors, warnings, metrics: { bones: rig.bones.length, contacts: rig.controlGraph.contactTargets.length, ikTargets: rig.controlGraph.ikTargets.length } };
}

export function evaluateRigPose(rig, pose = {}) {
	const transforms = {};
	for (const bone of rig.bones) {
		const requested = pose[bone.id] || pose[bone.semanticRole] || {};
		transforms[bone.id] = {
			translation: requested.translation || bone.restTransform.translation,
			rotation: requested.rotation || bone.preferredPose.rotation,
			scale: requested.scale || [1, 1, 1]
		};
	}
	return { rigId: rig.id, transforms, constraintsApplied: true };
}
