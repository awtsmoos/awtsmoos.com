// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeSemanticMaterialCatalog.js
 * @description Maps every procedural-core bark and leaf type to a high-resolution public asset.
 * The Awtsmoos reveals each species through its own garment; Awtsmoos.com preserves oak,
 * willow, pine, palm, redwood, sakura, and every neighboring form without generic canopy paint.
 */

import { publicMaterialUrl } from '../../assets/PublicMaterialOrigin.js';

const ILANOS = 'awtsmoos-nature/ilanos/trees/';
const BARK = 'awtsmoos-nature/chai-forest/textures/bark/';

const BARK_PATHS = Object.freeze({
	bark_acacia: `${ILANOS}acacia bark.png`,
	bark_apple: `${ILANOS}apple tree bark.png`,
	bark_ash: `${ILANOS}ash bark.png`,
	bark_aspen: `${ILANOS}aspen bark.png`,
	bark_baobab: `${ILANOS}baobab bark.png`,
	bark_birch: `${ILANOS}Birch bark.png`,
	bark_cedar: `${BARK}Bark006_1K-JPG/Bark006_1K-JPG_Color.jpg`,
	bark_cypress: `${ILANOS}cypress bark.png`,
	bark_dead: `${BARK}Bark015_1K-JPG/Bark015_1K-JPG_Color.jpg`,
	bark_mangrove: `${ILANOS}mangrove tree bark.png`,
	bark_maple: `${BARK}Bark007_1K-JPG/Bark007_1K-JPG_Color.jpg`,
	bark_oak: `${BARK}Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`,
	bark_olive: `${ILANOS}Olive tree bark.png`,
	bark_palm: `${ILANOS}palm bark.png`,
	bark_pine: `${BARK}Bark003_1K-JPG/Bark003_1K-JPG_Color.jpg`,
	bark_poplar: `${ILANOS}poplar bark.png`,
	bark_redwood: `${ILANOS}redwood bark.png`,
	bark_sakura: `${BARK}Bark014_1K-JPG/Bark014_1K-JPG_Color.jpg`,
	bark_willow: `${ILANOS}willow bark.png`
});

const LEAF_PATHS = Object.freeze({
	leaf_acacia_pinnate: `${ILANOS}acacia compound leaf.png`,
	leaf_apple: `${ILANOS}apple leaf.png`,
	leaf_ash: `${ILANOS}ash leaf.png`,
	leaf_aspen: `${ILANOS}aspen leaf.png`,
	leaf_baobab: `${ILANOS}baobab leaf.png`,
	leaf_birch: `${ILANOS}birtch leaf.png`,
	leaf_cedar_spray: `${ILANOS}cedar spray.png`,
	leaf_cypress_scale: `${ILANOS}cypress scale leaf.png`,
	leaf_dead: '',
	leaf_mangrove: `${ILANOS}mangrove leaf.png`,
	leaf_maple: `${ILANOS}maple leaf 2.png`,
	leaf_oak: `${ILANOS}oak leaf.png`,
	leaf_olive: `${ILANOS}olive leaf.png`,
	leaf_palm_frond: `${ILANOS}palm frond.png`,
	leaf_pine: `${ILANOS}pine needles.png`,
	leaf_poplar: `${ILANOS}poplar leaf.png`,
	leaf_redwood_needle: `${ILANOS}redwood needles.png`,
	leaf_sakura: `${ILANOS}sakura petal.png`,
	leaf_willow: `${ILANOS}willow leaf.png`
});

export function treeBarkTextureUrl(type) {
	return publicMaterialUrl(BARK_PATHS[type] || BARK_PATHS.bark_oak);
}

export function treeLeafTextureUrl(type) {
	const path = LEAF_PATHS[type] ?? LEAF_PATHS.leaf_oak;
	return path ? publicMaterialUrl(path) : '';
}

export function treeSemanticTextureUrls() {
	return Object.freeze([
		...Object.keys(BARK_PATHS).map(treeBarkTextureUrl),
		...Object.keys(LEAF_PATHS).map(treeLeafTextureUrl).filter(Boolean)
	]);
}

export const TREE_BARK_TEXTURE_TYPES = Object.freeze(Object.keys(BARK_PATHS));
export const TREE_LEAF_TEXTURE_TYPES = Object.freeze(Object.keys(LEAF_PATHS));
