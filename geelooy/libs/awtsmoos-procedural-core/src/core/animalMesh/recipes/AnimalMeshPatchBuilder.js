// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	hashStableRecipeValue
} from "../../recipes/stableRecipeJson.js";
import {
	ANIMAL_MESH_PATCH_SCHEMA,
	ANIMAL_MESH_SCHEMA_VERSION
} from "../constants/animalMeshContract.js";
import {
	readJsonPointer
} from "./jsonPointer.js";

export class AnimalMeshPatchBuilder {
	constructor(recipe) {
		if (!recipe?.recipe_id) {
			throw new Error('B"H | Patch builder requires a recipe.');
		}
		this.recipe = recipe;
		this.operations = [];
	}

	replace(path, newValue, reason) {
		const oldValue = readJsonPointer(this.recipe, path);
		if (oldValue === undefined) {
			throw new Error(`B"H | Replace path does not exist: ${path}`);
		}
		this.operations.push({
			op: "replace",
			path,
			old_value: cloneJson(oldValue),
			new_value: cloneJson(newValue),
			reason
		});
		return this;
	}

	scale(path, factor, reason) {
		const currentValue = readJsonPointer(this.recipe, path);
		if (!Number.isFinite(currentValue) || !Number.isFinite(factor)) {
			throw new Error('B"H | Scale patches require finite numbers.');
		}
		return this.replace(path, currentValue * factor, reason);
	}

	add(path, value, reason) {
		this.operations.push({
			op: "add",
			path,
			new_value: cloneJson(value),
			reason
		});
		return this;
	}

	remove(path, reason) {
		const oldValue = readJsonPointer(this.recipe, path);
		if (oldValue === undefined) {
			throw new Error(`B"H | Remove path does not exist: ${path}`);
		}
		this.operations.push({
			op: "remove",
			path,
			old_value: cloneJson(oldValue),
			reason
		});
		return this;
	}

	build(regenerateFromCommand = null) {
		if (this.operations.length === 0) {
			throw new Error('B"H | Patch builder has no operations.');
		}
		const identity = hashStableRecipeValue({
			recipe_id: this.recipe.recipe_id,
			operations: this.operations
		});
		const patch = {
			schema: ANIMAL_MESH_PATCH_SCHEMA,
			schema_version: ANIMAL_MESH_SCHEMA_VERSION,
			recipe_id: this.recipe.recipe_id,
			mode: "patch",
			patch_id: `patch_${identity}`,
			operations: cloneJson(this.operations)
		};
		if (regenerateFromCommand) {
			patch.regenerate_from_command = regenerateFromCommand;
		}
		return patch;
	}
}

function cloneJson(value) {
	return JSON.parse(JSON.stringify(value));
}
