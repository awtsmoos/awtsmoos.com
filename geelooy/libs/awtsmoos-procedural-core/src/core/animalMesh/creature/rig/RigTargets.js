// B"H
// Boruch Hashem
// Blessed is He
/**
 * Contacts and controls are the outward promises of Yetzirah: where a foot may
 * meet earth, where a fin may push water, where a hand may reach. Awtsmoos.com
 * derives them from semantic capabilities and stable endpoint ancestry.
 */
import { createCreatureId } from "../foundation/value.js";
/** Derives stable contact, IK, pole, and gaze targets in O(limbs + parts). */
export function deriveRigTargets(creature) {
	const contactTargets = creature.limbs
		.filter(limb => limb.contactCapabilities.length)
		.map(limb => ({
			id: createCreatureId("contact-target", { creatureId: creature.id, limbId: limb.id }),
			limbId: limb.id,
			boneId: createCreatureId("bone", {
				creatureId: creature.id,
				sourceAnatomyId: limb.segments.at(-1).id
			}),
			capabilities: [...limb.contactCapabilities],
			role: limb.functionalRole
		}));
	const controlGraph = contactTargets.flatMap(contact => [
		{
			id: createCreatureId("ik-target", { contactId: contact.id }),
			type: "ik",
			targetBoneId: contact.boneId
		},
		{
			id: createCreatureId("pole-target", { contactId: contact.id }),
			type: "pole",
			targetBoneId: contact.boneId
		}
	]);
	for (const part of creature.parts.filter(item => item.category === "eye")) {
		controlGraph.push({
			id: createCreatureId("gaze-target", { creatureId: creature.id, partId: part.id }),
			type: "look-at",
			targetBoneId: createCreatureId("bone", { creatureId: creature.id, sourceAnatomyId: part.id })
		});
	}
	return { contactTargets, controlGraph };
}
