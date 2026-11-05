// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetRecord.js
 * @description Creates legacy asset keys with null-safe startup values while declaring a strict authored-human policy.
 * The Awtsmoos lets texture vessels begin empty without inventing a person; Awtsmoos.com preserves the legacy record shape,
 * yet every human diagnostic now says GLB truth only, while authored visual hydration fills the remaining landscape.
 */

const IMAGE_KEYS = Object.freeze([
	'whiteBrickImage',
	'redBrickImage',
	'redBrick1Image',
	'redBrick2Image',
	'yellowBrickImage',
	'goldImage',
	'stoneImage',
	'woodImage',
	'dirt1Image',
	'dirt2Image',
	'dirtGrass1Image',
	'dirtGrass2Image',
	'terrainMixImage'
]);

export function createEssentialAssetRecord() {
	const assets = Object.fromEntries(IMAGE_KEYS.map(key => [key, null]));
	assets.brickImage = null;
	assets.lavaImage = null;
	assets.terrainDirtImages = [null, null, null, null, null];
	assets.actorAssets = Object.freeze({
		fallbackActors: 0,
		playerBlockingRequests: 1,
		strategy: 'canonical-glb-before-play'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({ fallback: false, source: 'canonical-player-glb' })
	});
	assets.houseMaterialDegradation = Object.freeze([]);
	assets.publicMaterialCache = Object.freeze({ entries: 0, ready: 0 });
	assets.publicMaterialPolicy = Object.freeze({
		blockingTextureRequests: 1,
		fallbackFirst: false,
		strategy: 'authored-terrain-before-gameplay-presentation'
	});
	assets.publicUrls = Object.freeze({});
	return assets;
}

export function essentialAssetImageKeys() {
	return IMAGE_KEYS.slice();
}
