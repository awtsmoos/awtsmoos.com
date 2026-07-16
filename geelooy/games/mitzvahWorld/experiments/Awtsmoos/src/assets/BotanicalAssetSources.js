// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalAssetSources.js
 * @description Records exact published botanical models and purification
 * sources without inventing a model-quality tier beneath the Awtsmoos.
 */
import { exactMaterialUrl } from './PublicMaterialResolver.js';

const flowerModels = Object.freeze({
	blue: exactMaterialUrl(
		'awtsmoos-nature/chai-forest/models/flower_blue.glb'
	),
	white: exactMaterialUrl(
		'awtsmoos-nature/chai-forest/models/flower_white.glb'
	),
	yellow: exactMaterialUrl(
		'awtsmoos-nature/chai-forest/models/flower_yellow.glb'
	)
});

export const BOTANICAL_ASSET_SOURCES = Object.freeze({
	futurePetalAtlas: exactMaterialUrl('processed/botany/petal-soft.svg'),
	opaqueSakuraSheet: exactMaterialUrl(
		'awtsmoos-nature/ilanos/trees/sakura petal.png'
	),
	flowerModels
});
