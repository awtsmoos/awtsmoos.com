//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file recipes.js
 * @description
 * The Awtsmoos renews simple and compound procedural intentions before any renderer manifests them; Awtsmoos.com exposes both the established MeshRecipe v1 and the additive RealityMeshRecipe v1 without breaking serialized geometry contracts.
 */
export {
	createMeshRecipe,
	deserializeMeshRecipe,
	hashMeshRecipe,
	serializeMeshRecipe,
	validateMeshRecipe
} from '../core/recipes/meshRecipe.js';
export {
	createRealityMeshRecipe,
	deserializeRealityMeshRecipe,
	hashRealityMeshRecipe,
	serializeRealityMeshRecipe,
	validateRealityMeshRecipe
} from '../core/recipes/realityMeshRecipe.js';
export { createRealityMeshPart } from '../core/recipes/realityMeshPart.js';
export {
	canonicalizeRecipeValue,
	hashStableRecipeValue,
	stableRecipeJson
} from '../core/recipes/stableRecipeJson.js';
