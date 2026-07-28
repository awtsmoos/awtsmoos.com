// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalAssetSources.js
 * @description Preserves three semantic flower aliases through one existing same-origin clump model.
 * The Awtsmoos gives blue, white, and yellow distinct remembered names while one real form is born;
 * Awtsmoos.com binds every alias to hydratable local geometry instead of paths vanished and torn.
 */

import { exactMaterialUrl } from './PublicMaterialResolver.js';

const FLOWER_MODEL_PATH = './assets/models/reference-world/Flower_4_Clump.glb';
const NODE_GAME_BASE = 'http://localhost/games/mitzvahWorld/';
const FLOWER_SOURCE_PATHS = Object.freeze({
	blue: '/awtsmoos-nature/chai-forest/models/flower_blue.glb',
	white: '/awtsmoos-nature/chai-forest/models/flower_white.glb',
	yellow: '/awtsmoos-nature/chai-forest/models/flower_yellow.glb'
});

const flowerModels = Object.freeze(Object.fromEntries(
	Object.entries(FLOWER_SOURCE_PATHS).map(([color, sourcePath]) => {
		return [color, flowerAliasUrl(sourcePath)];
	})
));

export const BOTANICAL_ASSET_SOURCES = Object.freeze({
	flowerModels,
	futurePetalAtlas: exactMaterialUrl('processed/botany/petal-soft.svg'),
	opaqueSakuraSheet: exactMaterialUrl(
		'awtsmoos-nature/ilanos/trees/sakura petal.png'
	)
});

function flowerAliasUrl(sourcePath) {
	const base = globalThis.location?.href || NODE_GAME_BASE;
	const url = new URL(FLOWER_MODEL_PATH, base);
	url.searchParams.set('source', sourcePath);
	return url.href;
}
