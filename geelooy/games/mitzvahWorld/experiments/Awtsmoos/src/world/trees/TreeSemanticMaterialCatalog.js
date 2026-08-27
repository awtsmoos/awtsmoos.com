// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeSemanticMaterialCatalog.js
 * @description Maps every semantic bark and leaf type to the uploaded filename-only texture library.
 * The Awtsmoos reveals each species through its own finite garment; Awtsmoos.com keeps filenames
 * free of transport while oak, willow, pine, palm, redwood, sakura, and their neighbors remain distinct.
 */

import {
	remoteFullResolutionTextureUrl,
	remoteTreeTextureUrl
} from '../../assets/RemoteTextureCatalog.js';

const BARK_SOURCES = Object.freeze({
	bark_acacia: tree('acacia bark.png'),
	bark_apple: tree('apple tree bark.png'),
	bark_ash: tree('ash bark.png'),
	bark_aspen: tree('aspen bark.png'),
	bark_baobab: tree('baobab bark.png'),
	bark_birch: tree('Birch bark.png'),
	bark_cedar: tree('cypress bark.png'),
	bark_cypress: tree('cypress bark.png'),
	bark_dead: full('tree bark 1.png'),
	bark_mangrove: tree('mangrove tree bark.png'),
	bark_maple: tree('aspen bark.png'),
	bark_oak: full('tree bark 1.png'),
	bark_olive: tree('Olive tree bark.png'),
	bark_palm: tree('palm bark.png'),
	bark_pine: tree('redwood bark.png'),
	bark_poplar: tree('poplar bark.png'),
	bark_redwood: tree('redwood bark.png'),
	bark_sakura: tree('apple tree bark.png'),
	bark_willow: tree('willow bark.png')
});

const LEAF_SOURCES = Object.freeze({
	leaf_acacia_pinnate: tree('acacia compound leaf.png'),
	leaf_apple: tree('apple leaf.png'),
	leaf_ash: tree('ash leaf.png'),
	leaf_aspen: tree('aspen leaf.png'),
	leaf_baobab: tree('baobab leaf.png'),
	leaf_birch: tree('birtch leaf.png'),
	leaf_cedar_spray: tree('cedar spray.png'),
	leaf_cypress_scale: tree('cypress scale leaf.png'),
	leaf_dead: null,
	leaf_mangrove: tree('mangrove leaf.png'),
	leaf_maple: tree('maple leaf 2.png'),
	leaf_oak: tree('oak leaf.png'),
	leaf_olive: tree('olive leaf.png'),
	leaf_palm_frond: tree('palm frond.png'),
	leaf_pine: tree('pine needles.png'),
	leaf_poplar: tree('poplar leaf.png'),
	leaf_redwood_needle: tree('redwood needles.png'),
	leaf_sakura: tree('sakura petal.png'),
	leaf_willow: tree('willow leaf.png')
});

export function treeBarkTextureUrl(type) {
	return resolveSource(BARK_SOURCES[type] || BARK_SOURCES.bark_oak);
}

export function treeLeafTextureUrl(type) {
	return resolveSource(LEAF_SOURCES[type] ?? LEAF_SOURCES.leaf_oak);
}

export function treeSemanticTextureUrls() {
	return Object.freeze([
		...Object.keys(BARK_SOURCES).map(treeBarkTextureUrl),
		...Object.keys(LEAF_SOURCES).map(treeLeafTextureUrl).filter(Boolean)
	]);
}

export function treeSemanticTextureFilenames() {
	return Object.freeze([
		...Object.values(BARK_SOURCES),
		...Object.values(LEAF_SOURCES)
	].filter(Boolean).map(source => source.filename));
}

export const TREE_BARK_TEXTURE_TYPES = Object.freeze(Object.keys(BARK_SOURCES));
export const TREE_LEAF_TEXTURE_TYPES = Object.freeze(Object.keys(LEAF_SOURCES));

function tree(filename) {
	return Object.freeze({ collection: 'tree', filename });
}

function full(filename) {
	return Object.freeze({ collection: 'full-resolution', filename });
}

function resolveSource(source) {
	if (!source) return '';
	return source.collection === 'tree'
		? remoteTreeTextureUrl(source.filename)
		: remoteFullResolutionTextureUrl(source.filename);
}
