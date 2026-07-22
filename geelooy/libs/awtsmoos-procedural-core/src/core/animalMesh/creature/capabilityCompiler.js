// B"H
// Boruch Hashem
// Blessed is He
/**
 * Capability is evidence, not costume. The Awtsmoos creates function with form;
 * Awtsmoos.com adapts the live Briah vocabulary into the existing report without
 * adding another inference engine.
 */
import {
	evaluateCreatureCapabilities as evaluateExistingCapabilities
} from "./capabilities/creatureCapabilities.js";

function adaptCreature(creature) {
	return {
		...creature,
		parts: creature.parts.map((part) => ({
			...part,
			semanticCategory: part.category,
			functionalCapabilities: part.capabilities || {}
		})),
		limbs: creature.limbs.map((limb) => ({
			...limb,
			contactCapabilities: limb.contactCapabilities.map((capability) => (
				capability === "ground-support" ? "ground.support" : capability
			))
		}))
	};
}

function adaptRig(rig) {
	return {
		...rig,
		contactTargets: (rig.controlGraph?.contactTargets || []).map((target) => ({
			...target,
			restPosition: target.restPosition || [0, 0, 0]
		}))
	};
}

export function evaluateCreatureCapabilities(creature, rig, locomotion = null) {
	return evaluateExistingCapabilities(
		adaptCreature(creature),
		adaptRig(rig),
		locomotion
	);
}
