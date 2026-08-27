// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HouseAssets.js
 * @description Loads preferred public house textures without making the network sovereign.
 * The Awtsmoos renews wall, stone, road, wood, and earth beyond any fetched image;
 * Awtsmoos.com preserves every public URL while authored colors remain the fallback keilim.
 */

import {
	TEXTURE_PURPOSES,
	TEXTURE_URLS
} from './TextureCatalog.js';
import { highestResolutionSurface } from './HighestResolutionSurfaceCatalog.js';

const HOUSE_IMAGE_ENTRIES = Object.freeze([
	entry('whiteBrickImage', TEXTURE_PURPOSES.houseWall, 'white-brick-house-wall'),
	entry('redBrickImage', TEXTURE_PURPOSES.lavaPlatform, 'red-brick-lava-platform'),
	entry('redBrick1Image', TEXTURE_URLS.bricks.red1, 'red-brick-variant-1'),
	entry('redBrick2Image', TEXTURE_URLS.bricks.red2, 'red-brick-variant-2'),
	entry('yellowBrickImage', TEXTURE_PURPOSES.road, 'yellow-brick-road'),
	entry('goldImage', TEXTURE_PURPOSES.coin, 'gold-coin'),
	entry('stoneImage', TEXTURE_PURPOSES.houseFloor, 'stone-house-floor'),
	entry('woodImage', TEXTURE_PURPOSES.houseDoor, 'wood-door-roof'),
	entry('dirt1Image', TEXTURE_URLS.terrain.dirt1, 'terrain-dirt-1'),
	entry('dirt2Image', TEXTURE_URLS.terrain.dirt2, 'terrain-dirt-2'),
	entry('dirtGrass1Image', TEXTURE_URLS.terrain.dirtGrass1, 'terrain-dirt-grass-1'),
	entry('dirtGrass2Image', TEXTURE_URLS.terrain.dirtGrass2, 'terrain-dirt-grass-2'),
	entry('terrainMixImage', highestResolutionSurface('dirt'), 'terrain-dirt-chai-pot')
]);

export async function loadHouseAssets(loadFirstImage) {
	const records = await Promise.all(
		HOUSE_IMAGE_ENTRIES.map(definition => loadPreferredEntry(
			definition,
			loadFirstImage
		))
	);
	const assets = Object.fromEntries(
		records.map(record => [record.key, record.image])
	);
	assets.brickImage = assets.whiteBrickImage;
	assets.lavaImage = assets.redBrickImage;
	assets.terrainDirtImages = [
		assets.dirt1Image,
		assets.dirt2Image,
		assets.dirtGrass1Image,
		assets.dirtGrass2Image,
		assets.terrainMixImage
	];
	assets.houseMaterialDegradation = records
		.filter(record => !record.image)
		.map(({ error, key, kind, url }) => ({ error, key, kind, url }));
	assets.publicUrls = Object.fromEntries(
		HOUSE_IMAGE_ENTRIES.map(definition => [definition.kind, definition.url])
	);
	return assets;
}

export function houseImageEntries() {
	return HOUSE_IMAGE_ENTRIES.map(definition => ({ ...definition }));
}

async function loadPreferredEntry(definition, loadFirstImage) {
	let image = null;
	let error = null;
	try {
		image = await loadFirstImage([definition.url], 15000);
	} catch (caught) {
		error = caught?.message || String(caught);
	}
	if (!validImage(image)) image = null;
	if (image) {
		image.dataset ||= {};
		image.dataset.AwtsmoosTextureKind = definition.kind;
		image.dataset.requestedAlias = definition.url;
	}
	return {
		...definition,
		error: image ? null : error || 'unavailable',
		image
	};
}

function validImage(image) {
	if (!image) return false;
	if (image.naturalWidth === undefined) return true;
	return image.naturalWidth > 0 && image.naturalHeight > 0;
}

function entry(key, url, kind) {
	return Object.freeze({ key, kind, url });
}
