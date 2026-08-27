// B"H
// Boruch Hashem
// Blessed is He

import { CreatureOperationError } from "./contracts.js";
import { createSemanticId } from "./identity.js";

function requireGroup(creature, groupId) {
	const group = creature.symmetryGroups.find((candidate) => candidate.id === groupId);
	if (!group) {
		throw new CreatureOperationError("CREATURE_SYMMETRY_NOT_FOUND", `Unknown symmetry group: ${groupId}`);
	}
	return group;
}

/**
 * Maintains symmetry as a persistent Tiferes relationship rather than destructive
 * duplication. Balance may hold bilateral, radial, rotational, repeated, custom,
 * or boundedly asymmetric members while their semantic identities remain distinct.
 * @param {Object} creature - Transaction-local Briah document.
 * @param {string} operation - Symmetry operation name.
 * @param {Object} argumentsValue - Group and property arguments.
 * @returns {Object} Updated symmetry group.
 */
export function applySymmetryOperation(creature, operation, argumentsValue = {}) {
	if (operation === "creature.symmetry.create") {
		const group = {
			id: argumentsValue.id || createSemanticId("symmetry", creature.id, creature.revision, creature.symmetryGroups.length, argumentsValue.type),
			type: argumentsValue.type || "bilateral",
			axis: [...(argumentsValue.axis || [1, 0, 0])],
			origin: [...(argumentsValue.origin || [0, 0, 0])],
			count: Number(argumentsValue.count || 2),
			memberIds: [...(argumentsValue.memberIds || [])],
			linkedProperties: [...(argumentsValue.linkedProperties || ["geometry"])],
			independentProperties: [...(argumentsValue.independentProperties || ["material"] )],
			boundedAsymmetry: argumentsValue.boundedAsymmetry || null,
			customTransforms: argumentsValue.customTransforms || [],
			broken: false,
			variation: {}
		};
		creature.symmetryGroups.push(group);
		return { symmetryGroup: group };
	}
	const group = requireGroup(creature, argumentsValue.groupId);
	if (operation === "creature.symmetry.link") {
		group.memberIds = [...new Set([...group.memberIds, ...(argumentsValue.memberIds || [])])];
	} else if (operation === "creature.symmetry.break") {
		group.broken = true;
	} else if (operation === "creature.symmetry.restore") {
		group.broken = false;
	} else if (operation === "creature.symmetry.property.link") {
		group.linkedProperties = [...new Set([...group.linkedProperties, argumentsValue.property])];
		group.independentProperties = group.independentProperties.filter((property) => property !== argumentsValue.property);
	} else if (operation === "creature.symmetry.property.unlink") {
		group.linkedProperties = group.linkedProperties.filter((property) => property !== argumentsValue.property);
		group.independentProperties = [...new Set([...group.independentProperties, argumentsValue.property])];
	} else if (operation === "creature.symmetry.variation.apply") {
		group.variation[argumentsValue.memberId || "all"] = argumentsValue.variation || {};
	} else if (operation !== "creature.symmetry.validate") {
		throw new CreatureOperationError("CREATURE_SYMMETRY_OPERATION_UNKNOWN", `Unsupported symmetry operation: ${operation}`);
	}
	return { symmetryGroup: group };
}
