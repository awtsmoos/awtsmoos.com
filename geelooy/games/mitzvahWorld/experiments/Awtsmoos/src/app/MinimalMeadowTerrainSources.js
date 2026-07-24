// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainSources.js
 * @description Loads full-resolution ground images and names their independent ecological roles.
 * The Awtsmoos gives every finite source its own vessel without forcing neighbors into a canvas;
 * Awtsmoos.com preserves original pixels so shader masks, not square mosaics, reveal one meadow.
 */

import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import {
	MINIMAL_MEADOW_FIREBASE_TEXTURES as T,
	minimalMeadowFirebaseTextureUrls
} from './MinimalMeadowFirebaseTextures.js?v=20260724-meadow-13';
import {
	loadMinimalMeadowTextureBatch,
	requireMinimalMeadowTextureImages
} from './MinimalMeadowTextureBatchLoader.js?v=20260724-meadow-14';

/**
 * Loads every authored source once and exposes both raw images and stable semantic roles.
 *
 * @param {object} options Optional progress callback.
 * @returns {Promise<object>} Source records, images, and independent role mapping.
 */
export async function loadMinimalMeadowTerrainSources(options = {}) {
	const [records, cobbleRecord] = await Promise.all([
		loadMinimalMeadowTextureBatch(
			minimalMeadowFirebaseTextureUrls(),
			(_, index, total) => options.onProgress?.({
				message: `Decoding ground source ${index + 1} of ${total}…`,
				progress: 0.14 + (index + 1) / total * 0.3
			})
		),
		loadPublicMaterialUrl(TEXTURE_URLS.stone.cobblestone, 18000)
	]);
	const images = requireMinimalMeadowTextureImages(Object.entries(T), records);
	images.cobblestone = cobbleRecord.ok
		? cobbleRecord.image
		: cachedTextureImage(TEXTURE_URLS.stone.cobblestone) || images.pathCenter;
	return {
		cobbleRecord,
		images,
		records,
		roles: minimalMeadowTerrainSourceRoles(images)
	};
}

/**
 * Assigns independent source images to renderer-facing ecological roles.
 *
 * @param {object} images Loaded source image dictionary.
 * @returns {object} Frozen role map with no resampling or composite canvas.
 */
export function minimalMeadowTerrainSourceRoles(images = {}) {
	return Object.freeze({
		dry: first(images.grassFive, images.grassSeven, images.dirtGrassOne),
		lush: first(images.grassOne, images.grassEight, images.grassFour),
		main: first(images.grassEight, images.grassOne, images.grassFour),
		marsh: first(images.marshGrass, images.grassFour, images.soilDark),
		mud: first(images.soilDark, images.tilledSoil, images.soilLight),
		path: first(images.cobblestone, images.pathCenter, images.soilLight),
		pathEdge: first(images.dirtGrassThree, images.dirtGrassOne, images.soilLight),
		secondary: first(images.grassFour, images.grassSeven, images.grassOne),
		soil: first(images.soilLight, images.tilledSoil, images.soilDark)
	});
}

function first(...values) {
	return values.find(Boolean) || null;
}
