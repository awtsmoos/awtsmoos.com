// B"H
// Boruch Hashem
// Blessed is He
/**
 * Gevurah gives each articulated segment truthful bounds while Briah remains the
 * editable authority. Awtsmoos.com changes semantic joint contracts so Yetzirah
 * is regenerated from anatomy instead of accepting an authoritative bone patch.
 */
import { cloneCreatureValue } from "./clone.js";
import { CreatureOperationError } from "./contracts.js";

function locateSegment(creature, input) {
	for (const limb of creature.limbs) {
		const index = input.limbId === limb.id && Number.isInteger(input.index)
			? input.index
			: limb.segments.findIndex((segment) => (
				segment.id === input.segmentId
				|| segment.id === input.sourceAnatomyId
			));
		if (index >= 0 && index < limb.segments.length) {
			return { limb, segment: limb.segments[index], joint: limb.jointSequence[index] };
		}
	}
	throw new CreatureOperationError(
		"CREATURE_RIG_CONSTRAINT_SOURCE_NOT_FOUND",
		"No limb segment owns the requested semantic rig constraint."
	);
}

/**
 * Applies one semantic joint-constraint edit to a transaction-local Briah document.
 * @returns {Object} Updated source segment and joint metadata.
 * @complexity O(l·s) across limb segments.
 * @deterministic Always for equal anatomy and arguments.
 * @sideEffects Mutates only the supplied transaction-local document.
 */
export function applyRigConstraintOperation(creature, input = {}) {
	const located = locateSegment(creature, input);
	const { segment, joint } = located;
	if (input.jointType) {
		segment.jointType = input.jointType;
		if (joint) joint.type = input.jointType;
	}
	for (const property of [
		"angularLimits", "preferredBendDirection",
		"twistLimits", "stretchLimits"
	]) {
		if (input[property] !== undefined) {
			segment[property] = cloneCreatureValue(input[property]);
		}
	}
	if (joint) {
		if (input.angularLimits) joint.limits = cloneCreatureValue(input.angularLimits);
		if (input.preferredBendDirection) {
			joint.preferredBendDirection = cloneCreatureValue(input.preferredBendDirection);
		}
	}
	return { limbId: located.limb.id, segment, joint: joint || null };
}
