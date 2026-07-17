// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	proceduralObjectPatchApplier
} from "../recipes/ProceduralObjectPatchApplier.js";
import {
	proceduralObjectCompiler
} from "./ProceduralObjectCompiler.js";

/**
 * Maintains a compiled recipe across immutable incremental patches.
 */
export class ProceduralObjectSession {
	constructor(recipe, options = {}) {
		this.compiler = options.compiler || proceduralObjectCompiler;
		this.patchApplier = options.patchApplier || proceduralObjectPatchApplier;
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
		const revision = Object.freeze({
			patch_id: result.patchId,
			affected_command_ids: result.affectedCommandIds
		});
		this.revisions.push(revision);
		return {
			recipe: this.recipe,
			artifact: this.artifact,
			revision
		};
	}
}
