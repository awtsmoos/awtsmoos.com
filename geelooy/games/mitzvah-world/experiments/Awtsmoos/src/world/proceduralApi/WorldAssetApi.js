// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldAssetApi.js
 * @description One JSON doorway into meshes, botany, terrain, rivers, wells, and water.
 */
import {
	AwtsmoosMesh,
	generateBotanicalPlant,
	validateBotanicalGeometry
} from '../../../../../../../libs/awtsmoos-procedural-core/src/index.js';
import { createFirebaseMaterialRecipe } from './FirebaseMaterialRecipe.js';
import { generateMarchingCubesVolume } from './MarchingCubesVolume.js';
import { generateRiverGeometry } from './RiverGeometry.js';
import { createWaterShaderRecipe } from './WaterShaderRecipe.js';
import { generateWellGeometry } from './WellGeometry.js';
import { requireWorldAssetRecipe } from './WorldAssetRecipe.js';

export async function generateWorldAsset(source) {
	const recipe = requireWorldAssetRecipe(source);
	let artifact;
	if (recipe.type === 'mesh.text') artifact = await AwtsmoosMesh.fromText(recipe.options.text, recipe.options);
	if (recipe.type === 'mesh.recipe') artifact = await AwtsmoosMesh.fromRecipe(recipe.options.recipe);
	if (recipe.type === 'terrain.marching-cubes') artifact = generateMarchingCubesVolume({ ...recipe.options, seed: recipe.seed, uv: recipe.uv });
	if (recipe.type === 'environment.river') artifact = generateRiverGeometry({ ...recipe.options, seed: recipe.seed });
	if (recipe.type === 'environment.well') artifact = generateWellGeometry({ ...recipe.options, seed: recipe.seed });
	if (recipe.type === 'material.water') artifact = createWaterShaderRecipe(recipe.options);
	if (recipe.type === 'botanical.plant') {
		artifact = generateBotanicalPlant({ ...recipe.options, seed: recipe.seed });
		const validation = validateBotanicalGeometry(artifact);
		if (!validation.ok) throw new Error(`Invalid botanical geometry: ${validation.issues.join(' ')}`);
	}
	if (!artifact) throw new Error(`No generator produced ${recipe.type}.`);
	return {
		artifact,
		id: recipe.id,
		material: recipe.material ? createFirebaseMaterialRecipe(recipe.material) : null,
		recipe,
		type: recipe.type,
		version: 1
	};
}

export async function generateWorldAssets(recipes) {
	if (!Array.isArray(recipes)) throw new Error('World asset recipes must be an array.');
	return Promise.all(recipes.map(generateWorldAsset));
}
