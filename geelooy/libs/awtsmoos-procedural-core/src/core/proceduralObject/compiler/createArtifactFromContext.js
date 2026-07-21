// B"H
// Boruch Hashem
// Blessed is He
/** Seals mutable compiler maps into one renderer-neutral immutable artifact. */

import { createProceduralArtifact } from "../artifact/createProceduralArtifact.js";

export function createArtifactFromContext(context) {
	const recipe = context.recipe;
	return createProceduralArtifact({
		schema_version: recipe.schema_version,
		recipe_id: recipe.recipe_id,
		geometries: Object.fromEntries(context.geometries),
		objects: Object.fromEntries(context.objects),
		rootObjectIds: Array.from(context.objects.values())
			.filter(object => !object.parentId)
			.map(object => object.id),
		materials: Object.fromEntries(context.materials),
		dataBlocks: Object.fromEntries(context.dataBlocks),
		links: context.links,
		armatures: Object.fromEntries(context.armatures),
		animations: Object.fromEntries(context.animations),
		topologyIdentities: Object.fromEntries(context.topologyIdentities),
		topologyRemaps: Object.fromEntries(context.topologyRemaps),
		selections: Object.fromEntries(context.selections),
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
