// B"H
// Boruch Hashem
// Blessed is He
/**
 * Each bone is a vessel for semantic ancestry, not an anonymous array slot.
 * Awtsmoos.com records exact rest form, constraints, skinning region, and
 * retargeting role so arbitrary creature rigs remain inspectable and portable.
 */
function distance(left, right) {
	return Math.hypot(...left.map((value, axis) => value - right[axis]));
}
/** Normalizes a direction in O(1), deterministically handling zero length. */
export function normalizeRigDirection(vector) {
	const length = Math.hypot(...vector) || 1;
	return vector.map(value => value / length);
}
/** Creates one complete semantic bone contract with no side effects. */
export function createSemanticBone(input) {
	return {
		id: input.id,
		parentBoneId: input.parentBoneId,
		parent: input.parentBoneId,
		semanticRole: input.semanticRole,
		sourceAnatomyId: input.sourceAnatomyId,
		restTransform: {
			translation: [...input.head],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		},
		head: [...input.head],
		tail: [...input.tail],
		length: distance(input.head, input.tail),
		radius: input.radius,
		jointConstraints: input.jointConstraints,
		degreesOfFreedom: input.degreesOfFreedom || ["swing-x", "swing-y", "twist"],
		preferredPose: { rotation: [0, 0, 0, 1] },
		lineage: {
			sourceAnatomyId: input.sourceAnatomyId,
			compiler: "yetzirah-rig-v1"
		},
		skinningRegion: input.skinningRegion,
		retargetingRole: input.retargetingRole || input.semanticRole
	};
}
