// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	PROCEDURAL_OBJECT_PATCH_SCHEMA,
	PROCEDURAL_OBJECT_SCHEMA_VERSION
} from "../constants/proceduralObjectContract.js";
import {
	commandsForPatchedPath,
	resolveAffectedCommands
} from "../compiler/affectedCommandResolver.js";
import {
	proceduralObjectRecipeValidator
} from "../validation/ProceduralObjectRecipeValidator.js";
import {
	readJsonPointer,
	writeJsonPointer
} from "./jsonPointer.js";

const LOCKED_PATHS = Object.freeze([
	"/schema",
	"/schema_version",
	"/recipe_id",
	"/mode"
]);

function cloneJson(value) {
	return value === undefined
		? undefined
		: JSON.parse(JSON.stringify(value));
}

export class ProceduralObjectPatchApplier {
	apply(recipe, patch) {
		this.assertEnvelope(recipe, patch);
		const nextRecipe = cloneJson(recipe);
		const directIds = new Set();
		for (const operation of patch.operations) {
			this.applyOperation(nextRecipe, operation);
			for (const id of commandsForPatchedPath(nextRecipe, operation.path)) {
				directIds.add(id);
			}
		}
		proceduralObjectRecipeValidator.assertValid(nextRecipe);
		return {
			recipe: nextRecipe,
			patchId: patch.patch_id,
			affectedCommandIds: resolveAffectedCommands(
				nextRecipe.commands,
				directIds
			)
		};
	}

	assertEnvelope(recipe, patch) {
		if (
			patch?.schema !== PROCEDURAL_OBJECT_PATCH_SCHEMA
			|| patch.schema_version !== PROCEDURAL_OBJECT_SCHEMA_VERSION
			|| patch.recipe_id !== recipe.recipe_id
			|| patch.mode !== "patch"
			|| !patch.patch_id
			|| !Array.isArray(patch.operations)
			|| patch.operations.length === 0
		) {
			throw new Error('B"H | Invalid procedural object patch envelope.');
		}
	}

	applyOperation(recipe, operation) {
		if (LOCKED_PATHS.some((path) => operation.path === path)) {
			throw new Error('B"H | Patch cannot mutate recipe identity.');
		}
		if (!["add", "replace", "remove"].includes(operation.op)) {
			throw new Error(`B"H | Unsupported patch operation: ${operation.op}`);
		}
		if (!operation.reason || typeof operation.reason !== "string") {
			throw new Error('B"H | Patch operations require reasons.');
		}
		const current = readJsonPointer(recipe, operation.path);
		if (
			"old_value" in operation
			&& JSON.stringify(current) !== JSON.stringify(operation.old_value)
		) {
			throw new Error(`B"H | Patch old_value mismatch at ${operation.path}`);
		}
		writeJsonPointer(
			recipe,
			operation.path,
			operation.op === "remove"
				? undefined
				: cloneJson(operation.new_value),
			operation.op
		);
	}
}

export const proceduralObjectPatchApplier = new ProceduralObjectPatchApplier();
