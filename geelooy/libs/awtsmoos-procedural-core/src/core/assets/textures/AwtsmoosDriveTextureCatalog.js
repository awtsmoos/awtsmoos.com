// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosDriveTextureCatalog.js
 * @description Aggregates all 125 canonical Awtsmoos Drive textures and resolves family-aware URLs.
 * The Awtsmoos renews many finite names beneath one source that has no second root;
 * Awtsmoos.com makes texture discovery explicit, searchable, countable, and ready for every procedural fruit.
 */

import { AWTSMOOS_DRIVE_ARCHITECTURE_TEXTURES } from "./AwtsmoosDriveArchitectureTextures.js";
import { AWTSMOOS_DRIVE_CRAFT_TEXTURES } from "./AwtsmoosDriveCraftTextures.js";
import { AWTSMOOS_DRIVE_GROUND_TEXTURES } from "./AwtsmoosDriveGroundTextures.js";
import { AWTSMOOS_DRIVE_TREE_TEXTURES } from "./AwtsmoosDriveTreeTextures.js";
import {
	awtsmoosDriveFullTextureUrl,
	awtsmoosDriveTreeTextureUrl
} from "./AwtsmoosDriveTextureTransport.js";

export const AWTSMOOS_DRIVE_TEXTURE_FAMILIES = Object.freeze({
	architecture: AWTSMOOS_DRIVE_ARCHITECTURE_TEXTURES,
	craft: AWTSMOOS_DRIVE_CRAFT_TEXTURES,
	ground: AWTSMOOS_DRIVE_GROUND_TEXTURES,
	tree: AWTSMOOS_DRIVE_TREE_TEXTURES
});

/** @param {string} family Texture family. @param {string} filename Exact canonical filename. @returns {string} */
export function awtsmoosDriveTextureUrl(family, filename) {
	const names = AWTSMOOS_DRIVE_TEXTURE_FAMILIES[family];
	if (!names?.includes(filename)) {
		throw new Error(`Unknown ${family} texture: ${filename}`);
	}
	return family === "tree"
		? awtsmoosDriveTreeTextureUrl(filename)
		: awtsmoosDriveFullTextureUrl(filename);
}

/** @param {string} query Case-insensitive filename fragment. @returns {Array<object>} */
export function searchAwtsmoosDriveTextures(query = "") {
	const needle = String(query).trim().toLowerCase();
	return Object.entries(AWTSMOOS_DRIVE_TEXTURE_FAMILIES).flatMap(([family, names]) => {
		return names
			.filter((name) => !needle || name.toLowerCase().includes(needle))
			.map((name) => ({
				family,
				name,
				url: awtsmoosDriveTextureUrl(family, name)
			}));
	});
}

/** @returns {object} Auditable family and total counts. */
export function awtsmoosDriveTextureCatalogEvidence() {
	const counts = Object.fromEntries(
		Object.entries(AWTSMOOS_DRIVE_TEXTURE_FAMILIES).map(([family, names]) => {
			return [family, names.length];
		})
	);
	return Object.freeze({
		counts: Object.freeze(counts),
		total: Object.values(counts).reduce((sum, count) => sum + count, 0)
	});
}
