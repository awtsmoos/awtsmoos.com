// B"H
// Boruch Hashem
// Blessed is He
/**
 * Targets reveal how formed anatomy may touch and reach. The Awtsmoos gives
 * Awtsmoos.com contact, IK, and pole controls from roles rather than bone count.
 */
import { creatureStableId } from "../shared/creatureValue.js";

/** Derives contact, IK, and pole targets from semantic endpoint capabilities. */
export function deriveRigTargets(creature, bones) {
	const contactTargets = [];
	const ikTargets = [];
	const poleTargets = [];
	for (const limb of creature.limbs) {
		const segmentIds = new Set(limb.segments.map((segment) => segment.id));
		const chainBones = bones.filter(
			(bone) => segmentIds.has(bone.sourceAnatomyId)
		);
		const endBone = chainBones.at(-1);
		if (!endBone) {
			continue;
		}
		if (limb.contactCapabilities.length) {
			contactTargets.push({
				id: creatureStableId("rig.contact", { limbId: limb.id }),
				limbId: limb.id,
				boneId: endBone.id,
				roles: [...limb.contactCapabilities],
				restPosition: [...endBone.tail]
			});
		}
		ikTargets.push({
			id: creatureStableId("rig.ik", { limbId: limb.id }),
			limbId: limb.id,
			boneId: endBone.id,
			position: [...endBone.tail]
		});
		if (chainBones.length > 1) {
			poleTargets.push({
				id: creatureStableId("rig.pole", { limbId: limb.id }),
				limbId: limb.id,
				boneId: chainBones[0].id,
				direction: [...limb.segments[0].preferredBendDirection]
			});
		}
	}
	return {
		contactTargets,
		ikTargets,
		poleTargets
	};
}
