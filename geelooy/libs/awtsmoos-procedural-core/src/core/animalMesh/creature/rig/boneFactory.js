// B"H
// Boruch Hashem
// Blessed is He
/**
 * Every formed bone is a named vessel for one anatomical source. The Awtsmoos
 * renews its rest frame while Awtsmoos.com preserves lineage beyond topology.
 */
import {
	cloneCreatureValue,
	creatureStableId
} from "../shared/creatureValue.js";

/**
 * Creates one deterministic semantic bone.
 * @param {string} sourceAnatomyId Stable Briah source ID.
 * @param {string} semanticRole Anatomy-aware rig role.
 * @param {string|null} parentBoneId Parent identity.
 * @param {number[]} head Rest-space head.
 * @param {number[]} tail Rest-space tail.
 * @param {object} input Constraint and retargeting metadata.
 * @returns {object} Renderer-neutral Yetzirah bone.
 */
export function createYetzirahBone(
	sourceAnatomyId,
	semanticRole,
	parentBoneId,
	head,
	tail,
	input = {}
) {
	const length = Math.max(
		0.0001,
		Math.hypot(
			tail[0] - head[0],
			tail[1] - head[1],
			tail[2] - head[2]
		)
	);
	return {
		id: creatureStableId("yetzirah.bone", {
			sourceAnatomyId,
			semanticRole
		}),
		parentBoneId,
		semanticRole,
		sourceAnatomyId,
		restTransform: {
			position: [...head],
			rotation: [0, 0, 0, 1],
			scale: [1, 1, 1]
		},
		head: [...head],
		tail: [...tail],
		length,
		radius: Math.max(0.005, input.radius || length * 0.12),
		jointConstraints: cloneCreatureValue(
			input.jointConstraints || {
				type: "ball",
				angularLimits: {
					swing: [-1, 1],
					twist: [-0.5, 0.5]
				}
			}
		),
		degreesOfFreedom: cloneCreatureValue(
			input.degreesOfFreedom || ["swingX", "swingZ", "twist"]
		),
		preferredPose: cloneCreatureValue(
			input.preferredPose || {
				bendDirection: [0, 0, 1],
				twist: 0
			}
		),
		lineage: {
			sourceAnatomyId,
			compiler: "yetzirah-rig-1.0.0"
		},
		skinningRegion: input.skinningRegion || semanticRole,
		retargetingRole: input.retargetingRole || semanticRole,
		twistLimits: cloneCreatureValue(input.twistLimits || [-0.5, 0.5]),
		stretchPolicy: cloneCreatureValue(
			input.stretchPolicy || {
				minimum: 0.85,
				maximum: 1.15
			}
		)
	};
}
