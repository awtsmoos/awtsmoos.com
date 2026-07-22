// B"H
// Boruch Hashem
// Blessed is He

import { CreatureOperationError } from "./contracts.js";
import { createSemanticId } from "./identity.js";
import { createLimbChain } from "./limbFactory.js";

function requireLimb(creature, limbId) {
	const limb = creature.limbs.find((candidate) => candidate.id === limbId);
	if (!limb) {
		throw new CreatureOperationError("CREATURE_LIMB_NOT_FOUND", `Unknown limb chain: ${limbId}`);
	}
	return limb;
}

function createPair(creature, options) {
	const groupId = createSemanticId("symmetry", creature.id, creature.revision, "limb-pair", creature.limbs.length);
	const left = createLimbChain(creature, { ...options, side: "left", symmetryRelationship: groupId });
	creature.limbs.push(left);
	const right = createLimbChain(creature, { ...options, side: "right", symmetryRelationship: groupId });
	creature.limbs.push(right);
	creature.symmetryGroups.push({
		id: groupId,
		type: "bilateral",
		memberIds: [left.id, right.id],
		linkedProperties: ["segments", "functionalRole", "parentAnatomicalAnchor"],
		broken: false,
		variation: {}
	});
	return [left, right];
}

/**
 * Applies articulated-limb operations while preserving chain identity.
 * @param {Object} creature - Transaction-local Briah document.
 * @param {string} operation - Public limb operation name.
 * @param {Object} argumentsValue - Semantic chain edit arguments.
 * @returns {Object} Edited limb or limbs.
 * @complexity O(l + s), where l is limb count and s is segment count.
 * @deterministic Always.
 * @sideEffects Mutates only the supplied document.
 */
export function applyLimbOperation(creature, operation, argumentsValue = {}) {
	if (operation === "creature.limb.createPair") {
		return { limbs: createPair(creature, argumentsValue) };
	}
	if (operation === "creature.limb.create") {
		const limb = createLimbChain(creature, argumentsValue);
		creature.limbs.push(limb);
		return { limb };
	}
	const limb = requireLimb(creature, argumentsValue.limbId);
	if (operation === "creature.limb.joint.insert") {
		const index = Math.max(0, Math.min(limb.segments.length, argumentsValue.index ?? limb.segments.length));
		const segmentId = createSemanticId("segment", limb.id, creature.revision, index, argumentsValue.segment || {});
		limb.segments.splice(index, 0, {
			id: segmentId,
			length: Number(argumentsValue.segment?.length ?? 0.5),
			radiusStart: Number(argumentsValue.segment?.radiusStart ?? 0.12),
			radiusEnd: Number(argumentsValue.segment?.radiusEnd ?? 0.09),
			restDirection: [...(argumentsValue.segment?.restDirection || [0, -1, 0])],
			jointType: argumentsValue.segment?.jointType || "hinge",
			angularLimits: argumentsValue.segment?.angularLimits || { minimum: -1, maximum: 1 },
			preferredBendDirection: [...(argumentsValue.segment?.preferredBendDirection || [0, 0, 1])],
			twistLimits: argumentsValue.segment?.twistLimits || { minimum: -0.5, maximum: 0.5 },
			stretchLimits: argumentsValue.segment?.stretchLimits || { minimum: 0.8, maximum: 1.2 }
		});
		limb.jointSequence.splice(index, 0, { id: createSemanticId("joint", limb.id, creature.revision, index), type: "hinge", limits: { minimum: -1, maximum: 1 }, preferredBendDirection: [0, 0, 1] });
	} else if (operation === "creature.limb.joint.remove") {
		limb.segments.splice(argumentsValue.index, 1);
		limb.jointSequence.splice(argumentsValue.index, 1);
	} else if (operation === "creature.limb.joint.move") {
		limb.segments[argumentsValue.index].restDirection = [...argumentsValue.restDirection];
	} else if (operation === "creature.limb.segment.length.set") {
		limb.segments[argumentsValue.index].length = Number(argumentsValue.length);
	} else if (operation === "creature.limb.segment.radius.set") {
		Object.assign(limb.segments[argumentsValue.index], { radiusStart: Number(argumentsValue.radiusStart), radiusEnd: Number(argumentsValue.radiusEnd) });
	} else if (operation === "creature.limb.role.set") {
		limb.functionalRole = argumentsValue.role;
	} else if (operation === "creature.limb.endpoint.attach") {
		limb.endpoint = { definitionId: argumentsValue.definitionId, parameters: argumentsValue.parameters || {} };
	} else if (operation === "creature.limb.branch") {
		limb.branches.push(createLimbChain(creature, { ...argumentsValue, parentAnatomicalAnchor: argumentsValue.segmentId }));
	} else if (operation !== "creature.limb.validate") {
		throw new CreatureOperationError("CREATURE_LIMB_OPERATION_UNKNOWN", `Unsupported limb operation: ${operation}`);
	}
	return { limb };
}
