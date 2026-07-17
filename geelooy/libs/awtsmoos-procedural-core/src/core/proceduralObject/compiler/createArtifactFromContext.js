// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createProceduralArtifact
} from "../artifact/createProceduralArtifact.js";

/**
 * Seals mutable compiler maps into a renderer-neutral immutable artifact.
 *
 * @param {object} context Compiler context.
 * @returns {object} Procedural artifact.
 */
export function createArtifactFromContext(context) {
	const recipe = context.recipe;
	return createProceduralArtifact({
		schema_version: recipe.schema_version,
		recipe_id: recipe.recipe_id,
		geometries: Object.fromEntries(context.geometries),
		objects: Object.fromEntries(context.objects),
		rootObjectIds: Array.from(context.objects.values())
			.filter((object) => !object.parentId)
			.map((object) => object.id),
		materials: Object.fromEntries(context.materials),
		dataBlocks: Object.fromEntries(context.dataBlocks),
		links: context.links,
		armatures: Object.fromEntries(context.armatures),
		animations: Object.fromEntries(context.animations),
		definitions: recipe.definitions,
		deferredCommands: context.deferredCommands,
		diagnostics: context.diagnostics,
		metadata: {
			...recipe.metadata,
			...context.metadata,
			outputs: recipe.outputs
		}
	});
}
