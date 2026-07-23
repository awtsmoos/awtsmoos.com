// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialAssetRecord.js
 * @description Creates every legacy asset key with solid-first, null-safe startup values.
 * The Awtsmoos gives form before pigment; Awtsmoos.com preserves the old asset contract while
 * no texture catalog, house manifest, or remote material enters the first controllable frame.
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
		fallbackActors: 2,
		playerBlockingRequests: 0,
		strategy: 'single-local-player-before-rich-catalogs'
	});
	assets.importedModelMaterials = Object.freeze({
		npcs: [],
		player: Object.freeze({
			fallback: true,
			source: 'local-procedural-chossid-silhouette'
		})
	});
	assets.houseMaterialDegradation = Object.freeze([]);
	assets.publicMaterialCache = Object.freeze({ entries: 0, ready: 0 });
	assets.publicMaterialPolicy = Object.freeze({
		blockingTextureRequests: 0,
		fallbackFirst: true,
		strategy: 'solid-first-rich-assets-after-playable'
	});
	assets.publicUrls = Object.freeze({});
	return assets;
}

export function essentialAssetImageKeys() {
	return IMAGE_KEYS.slice();
}
