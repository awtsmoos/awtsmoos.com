// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainSources.js
 * @description Loads uploaded full-resolution filenames into independent ecological terrain roles.
 * The Awtsmoos gives grass, dirt, marsh, shoulder, and road their own light; Awtsmoos.com keeps
 * original pixels intact so continuous masks reveal mixture without mosaic, downscale, or disguise.
 */

import {
	MINIMAL_MEADOW_FIREBASE_TEXTURES as TEXTURES,
	minimalMeadowFirebaseTextureUrls
} from './MinimalMeadowFirebaseTextures.js?v=20260727-remote-textures-1';
import {
	loadMinimalMeadowTextureBatch,
	requireMinimalMeadowTextureImages
} from './MinimalMeadowTextureBatchLoader.js?v=20260724-meadow-14';

export async function loadMinimalMeadowTerrainSources(options = {}) {
	const urls = minimalMeadowFirebaseTextureUrls();
	const records = await loadMinimalMeadowTextureBatch(
		urls,
		(_, index, total) => options.onProgress?.({
			message: `Decoding ground source ${index + 1} of ${total}…`,
			progress: 0.14 + (index + 1) / total * 0.3
		})
	);
	const images = requireMinimalMeadowTextureImages(
		Object.entries(TEXTURES),
		records
	);
	const cobbleRecord = records.find(record => {
		return record.url === TEXTURES.roadCobblestone
			|| record.primaryUrl === TEXTURES.roadCobblestone;
	}) || null;
	return {
		cobbleRecord,
		images,
		records,
		roles: minimalMeadowTerrainSourceRoles(images)
	};
}

export function minimalMeadowTerrainSourceRoles(images = {}) {
	return Object.freeze({
		dry: first(images.grassFive, images.dirtGrassOne, images.grassSeven),
		lush: first(images.grassOne, images.grassEight, images.grassFour),
		main: first(images.grassFour, images.grassOne, images.grassEight),
		marsh: first(images.marshGrass, images.dirtGrassSix, images.soilDark),
		mud: first(images.soilDark, images.tilledSoil, images.soilLight),
		path: first(images.roadCobblestone, images.pathCenter, images.soilLight),
		pathEdge: first(images.dirtGrassThree, images.dirtGrassSix, images.dirtGrassOne),
		secondary: first(images.grassEight, images.grassSeven, images.grassOne),
		soil: first(images.soilLight, images.soilDark, images.tilledSoil)
	});
}

function first(...values) {
	return values.find(Boolean) || null;
}
