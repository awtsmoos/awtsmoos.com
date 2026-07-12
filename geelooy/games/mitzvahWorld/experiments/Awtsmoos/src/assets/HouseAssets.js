// B"H
import {
	TEXTURE_PURPOSES,
	TEXTURE_URLS,
	publicTextureUrls
} from './TextureCatalog.js';

const REQUIRED_HOUSE_IMAGES = Object.freeze([
	['whiteBrickImage', TEXTURE_PURPOSES.houseWall, 'white-brick-house-wall'],
	['redBrickImage', TEXTURE_PURPOSES.lavaPlatform, 'red-brick-lava-platform'],
	['redBrick1Image', TEXTURE_URLS.bricks.red1, 'red-brick-variant-1'],
	['redBrick2Image', TEXTURE_URLS.bricks.red2, 'red-brick-variant-2'],
	['yellowBrickImage', TEXTURE_PURPOSES.road, 'yellow-brick-road'],
	['goldImage', TEXTURE_PURPOSES.coin, 'gold-coin'],
	['stoneImage', TEXTURE_PURPOSES.houseFloor, 'stone-house-floor'],
	['woodImage', TEXTURE_PURPOSES.houseDoor, 'wood-door-roof'],
	['dirt1Image', TEXTURE_URLS.terrain.dirt1, 'terrain-dirt-1'],
	['dirt2Image', TEXTURE_URLS.terrain.dirt2, 'terrain-dirt-2'],
	['dirtGrass1Image', TEXTURE_URLS.terrain.dirtGrass1, 'terrain-dirt-grass-1'],
	['dirtGrass2Image', TEXTURE_URLS.terrain.dirtGrass2, 'terrain-dirt-grass-2'],
	['terrainMixImage', TEXTURE_URLS.terrain.dirtGrass3, 'terrain-dirt-grass-3']
]);

/**
 * Resolves every house image from the already-hydrated shared cache.
 * Failure is explicit: the village must never silently replace masonry with a painted canvas.
 */
export async function loadHouseAssets(loadFirstImage) {
	const entries = await Promise.all(
		REQUIRED_HOUSE_IMAGES.map(([key, url, kind]) => loadRequiredEntry(
			loadFirstImage,
			key,
			url,
			kind
		))
	);
	const assets = Object.fromEntries(entries);
	assets.brickImage = assets.whiteBrickImage;
	assets.terrainDirtImages = [
		assets.dirt1Image,
		assets.dirt2Image,
		assets.dirtGrass1Image,
		assets.dirtGrass2Image,
		assets.terrainMixImage
	];
	assets.lavaImage = assets.redBrickImage;
	assets.publicUrls = publicTextureUrls();
	return assets;
}

async function loadRequiredEntry(loadFirstImage, key, url, kind) {
	const image = await loadFirstImage([url], 15000);
	if (!image?.naturalWidth || !image?.naturalHeight) {
		throw new Error(`Required public house material did not load: ${kind} (${url})`);
	}
	image.dataset.kind = kind;
	image.dataset.requestedAlias = url;
	return [key, image];
}
