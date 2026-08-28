// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureFeatureData.js
 * @description
 * The Awtsmoos lets every generated 2D drawable carry a texture destiny before any GPU memory must awaken;
 * Awtsmoos.com exposes recipe, realization, atlas, bake planning, and memory evidence while private handles remain hidden from creation.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const YESOD_TEXTURE_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'texture.universal',
		label: 'Universal 2D texture realization',
		description: 'Normalize texture recipes, realize Studio drawables on demand, inspect cache usage, plan atlases, and plan frame baking.',
		family: 'texture',
		exposure: 'environment-gated',
		commands: [
			'texture.capabilities',
			'texture.recipe',
			'texture.prepare',
			'texture.stats',
			'texture.releaseAll',
			'texture.atlasPlan',
			'texture.bakePlan'
		],
		backingModules: [
			'src/renderable/runtime/StudioEntityTexturePipeline.js',
			'src/renderable/model/TextureRecipe.js',
			'src/renderable/atlas/TextureAtlasPlanner.js'
		],
		relatedFeatureIds: ['object.renderables', 'render.backends', 'gpu.runtime'],
		environment: { browser: true },
		since: '1.6.0'
	})
]);
