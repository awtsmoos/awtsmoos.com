// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";
import {
	commandsForPatchedPath,
	resolveAffectedCommands
} from "../compiler/affectedCommandResolver.js";
import {
	animalMeshRecipeValidator
} from "../validation/AnimalMeshRecipeValidator.js";
import {
	readJsonPointer,
	writeJsonPointer
} from "./jsonPointer.js";
import {
	assertMutableAnimalMeshPatchPath
} from "./patchPathRules.js";

function cloneJson(value) {
	return value === undefined
		? undefined
		: JSON.parse(JSON.stringify(value));
}

function equalJson(left, right) {
	return JSON.stringify(left) === JSON.stringify(right);
}

export class AnimalMeshPatchApplier {
	apply(recipe, patch) {
		this.assertPatchEnvelope(recipe, patch);
		const nextRecipe = cloneJson(recipe);
		const directCommandIds = new Set();

		for (const operation of patch.operations) {
			this.applyOperation(nextRecipe, operation);
			for (const commandId of commandsForPatchedPath(nextRecipe, operation.path)) {
				directCommandIds.add(commandId);
			}
		}
		animalMeshRecipeValidator.assertValid(nextRecipe);
		const affectedCommandIds = resolveAffectedCommands(
			nextRecipe.commands,
			directCommandIds
		);
		return {
			recipe: nextRecipe,
			patchId: patch.patch_id,
			affectedCommandIds,
			regenerateFromCommand: (
				patch.regenerate_from_command ||
				affectedCommandIds[0] ||
				null
			)
		};
	}

	assertPatchEnvelope(recipe, patch) {
		if (patch?.schema !== ANIMAL_MESH_PATCH_SCHEMA) {
			throw new Error('B"H | Unknown animal mesh patch schema.');
		}
		if (patch.schema_version !== ANIMAL_MESH_SCHEMA_VERSION) {
			throw new Error('B"H | Unsupported animal mesh patch version.');
		}
		if (patch.recipe_id !== recipe.recipe_id) {
			throw new Error('B"H | Patch recipe_id does not match the recipe.');
		}
		if (
			patch.mode !== "patch" ||
			!patch.patch_id ||
			!Array.isArray(patch.operations) ||
			patch.operations.length === 0
		) {
			throw new Error('B"H | Patch id, mode, and operations are required.');
		}
	}

	applyOperation(recipe, operation) {
		assertMutableAnimalMeshPatchPath(operation.path);
		if (!operation.reason || typeof operation.reason !== "string") {
			throw new Error('B"H | Every patch operation requires a reason.');
		}
		if (![
			"add",
			"replace",
			"remove"
		].includes(operation.op)) {
			throw new Error(`B"H | Unsupported patch operation: ${operation.op}`);
		}
		const currentValue = readJsonPointer(recipe, operation.path);
		if (
			"old_value" in operation &&
			!equalJson(currentValue, operation.old_value)
		) {
			throw new Error(`B"H | Patch old_value mismatch at ${operation.path}`);
		}
		const nextValue = operation.op === "remove"
			? undefined
			: cloneJson(operation.new_value);
		writeJsonPointer(recipe, operation.path, nextValue, operation.op);
	}

}

export const animalMeshPatchApplier = new AnimalMeshPatchApplier();
