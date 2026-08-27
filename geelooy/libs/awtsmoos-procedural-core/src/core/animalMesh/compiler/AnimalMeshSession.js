// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	animalMeshCompiler
} from "./AnimalMeshCompiler.js";
import {
	animalMeshPatchApplier
} from "../recipes/AnimalMeshPatchApplier.js";

export class AnimalMeshSession {
	constructor(recipe, options = {}) {
		this.compiler = options.compiler || animalMeshCompiler;
		this.patchApplier = options.patchApplier || animalMeshPatchApplier;
		this.recipe = recipe;
		this.artifact = this.compiler.compile(recipe, options);
		this.revisions = [];
	}

	applyPatch(patch, options = {}) {
		const result = this.patchApplier.apply(this.recipe, patch);
		const previousArtifact = this.artifact;
		this.recipe = result.recipe;
		this.artifact = this.compiler.compile(this.recipe, {
			...options,
			previousArtifact,
			commandIds: result.affectedCommandIds
		});
		this.revisions.push({
			patch_id: result.patchId,
			affected_command_ids: result.affectedCommandIds,
			regenerate_from_command: result.regenerateFromCommand
		});
		return {
			recipe: this.recipe,
			artifact: this.artifact,
			revision: this.revisions[this.revisions.length - 1]
		};
	}
}
