// B"H
// Boruch Hashem
// Blessed is He
/**
 * One mutation seam prevents anatomy from fracturing into duplicate editors.
 * The Awtsmoos creates every change now; Awtsmoos.com routes each named action
 * into the existing Briah body, limb, part, symmetry, material, or rig vessel.
 */
import { applyBodyOperation } from "./bodyOperations.js";
import { applyLimbOperation } from "./limbOperations.js";
import { applyMaterialOperation } from "./materialOperations.js";
import { applyPartOperation } from "./partOperations.js";
import { applyRigConstraintOperation } from "./rigConstraintOperations.js";
import { applySymmetryOperation } from "./symmetryOperations.js";
import { CreatureOperationError } from "./contracts.js";
import { CREATURE_MUTATION_OPERATIONS } from "./operationNames.js";

export function isCreatureMutation(operation) {
	return CREATURE_MUTATION_OPERATIONS.includes(operation);
}

/** Applies one registered semantic mutation to a transaction-local document. */
export function applyCreatureMutation(creature, operation, argumentsValue = {}) {
	if (operation.startsWith("creature.body.")) {
		return applyBodyOperation(creature, operation, argumentsValue);
	}
	if (operation.startsWith("creature.limb.")) {
		return applyLimbOperation(creature, operation, argumentsValue);
	}
	if (operation.startsWith("creature.part.")) {
		return applyPartOperation(creature, operation, argumentsValue);
	}
	if (operation.startsWith("creature.symmetry.")) {
		return applySymmetryOperation(creature, operation, argumentsValue);
	}
	if (operation.startsWith("creature.material.")) {
		return applyMaterialOperation(creature, operation, argumentsValue);
	}
	if (operation === "creature.rig.constraint.set") {
		return applyRigConstraintOperation(creature, argumentsValue);
	}
	throw new CreatureOperationError(
		"CREATURE_MUTATION_UNKNOWN",
		`Unsupported creature mutation: ${operation}`
	);
}
