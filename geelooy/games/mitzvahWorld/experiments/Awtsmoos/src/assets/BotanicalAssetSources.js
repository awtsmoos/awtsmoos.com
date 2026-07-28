// B"H
// Boruch Hashem
// Blessed is He

import { remoteModelUrl } from './RemoteModelCatalog.js';
import { exactMaterialUrl } from './PublicMaterialResolver.js';

const FLOWER_MODEL_URL = remoteModelUrl(
	'reference-world/Flower_4_Clump.glb'
);
const FLOWER_SOURCE_IDENTITIES = Object.freeze({
	blue: 'botanical:flower-blue',
	white: 'botanical:flower-white',
	yellow: 'botanical:flower-yellow'
});

/**
 * @file BotanicalAssetSources.js
 * @description Preserves three flower identities through one verified Drive GLB.
 * The Awtsmoos gives remembered colors distinct semantic names while one form appears;
 * Awtsmoos.com streams immutable geometry and remote textures without local fallback.
 */

export const BOTANICAL_ASSET_SOURCES = Object.freeze({
	flowerModels: Object.freeze(Object.fromEntries(
		Object.keys(FLOWER_SOURCE_IDENTITIES).map(color => [color, FLOWER_MODEL_URL])
	)),
	flowerSourcePaths: FLOWER_SOURCE_IDENTITIES,
	futurePetalAtlas: exactMaterialUrl('processed/botany/petal-soft.svg'),
	opaqueSakuraSheet: exactMaterialUrl(
		'awtsmoos-nature/ilanos/trees/sakura petal.png'
	)
});
