// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalAssetSources.js
 * @description Records models and unpublished purification sources without
 * placing them in the critical image preload. Distinct vessels await Awtsmoos.
 */
import { exactMaterialUrl } from './PublicMaterialResolver.js';

export const BOTANICAL_ASSET_SOURCES = Object.freeze({
	futurePetalAtlas: exactMaterialUrl('processed/botany/petal-soft.svg'),
	opaqueSakuraSheet: exactMaterialUrl(
		'awtsmoos-nature/ilanos/trees/sakura petal.png'
	),
	flowerModels: Object.freeze({
		pink: exactMaterialUrl(
			'awtsmoos-nature/chai-forest/models/Flowers_Pink.glb'
		),
		white: exactMaterialUrl(
			'awtsmoos-nature/chai-forest/models/Flowers_White.glb'
		),
		purple: exactMaterialUrl(
			'awtsmoos-nature/chai-forest/models/Flowers_Purple.glb'
		)
	})
});
