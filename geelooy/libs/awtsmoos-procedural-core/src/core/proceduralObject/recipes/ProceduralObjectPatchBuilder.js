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

/**
 * Fluent immutable builder for inspectable recipe corrections.
 */
export class ProceduralObjectPatchBuilder {
	constructor(recipeId, patchId) {
		this.recipeId = recipeId;
		this.patchId = patchId;
		this.operations = [];
	}

	add(path, newValue, reason) {
		return this.push("add", path, undefined, newValue, reason);
	}

	replace(path, oldValue, newValue, reason) {
		return this.push("replace", path, oldValue, newValue, reason);
	}

	remove(path, oldValue, reason) {
		return this.push("remove", path, oldValue, undefined, reason);
	}

	push(op, path, oldValue, newValue, reason) {
		this.operations.push({
			op,
			path,
			...(oldValue !== undefined ? {old_value: oldValue} : {}),
			...(newValue !== undefined ? {new_value: newValue} : {}),
			reason
		});
		return this;
	}

	build() {
		return {
			schema: PROCEDURAL_OBJECT_PATCH_SCHEMA,
			schema_version: PROCEDURAL_OBJECT_SCHEMA_VERSION,
			recipe_id: this.recipeId,
			mode: "patch",
			patch_id: this.patchId,
			operations: this.operations.map((operation) => ({...operation}))
		};
	}
}
