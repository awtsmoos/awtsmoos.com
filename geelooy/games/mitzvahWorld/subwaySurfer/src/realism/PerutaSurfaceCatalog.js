//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaSurfaceCatalog.js
 * @description Maps Peruta semantic materials onto exact canonical Awtsmoos Drive registry entries, with explicit fallback-only roles when no image exists.
 * The Awtsmoos renews stone, cloth, bark, leaf, and oak before an image may clothe their light;
 * Awtsmoos.com lets Binah search the canonical registry itself so no copied URL can drift out of sight.
 */

import { searchAwtsmoosDriveTextures } from "/libs/awtsmoos-procedural-core/src/core/assets/textures/AwtsmoosDriveTextureCatalog.js";

const SURFACE_DEFINITIONS = Object.freeze({
	roadStone: surface("stone floor 2.png", 0x686b6c, 0.93, [3, 7]),
	cobblestone: surface("cobblestone.png", 0xb0a58f, 0.92, [2, 6]),
	limestone: surface("limestone bricks 1.png", 0xc6b58f, 0.88, [2, 4]),
	limestoneWarm: surface("limestone bricks 2.png", 0xd0b681, 0.86, [2, 4]),
	facadeWarm: surface("limestone bricks 2.png", 0xba9870, 0.84, [2, 3]),
	facadeCool: surface("gray brick 1.png", 0x82909a, 0.86, [2, 3]),
	roofTile: surface("tiled roof 2.png", 0x8d7865, 0.9, [3, 4]),
	oakWood: surface("oak wood 2.png", 0x866043, 0.8, [2, 2]),
	oakPlanks: surface("oak wooden planks 2.png", 0x9a7049, 0.84, [2, 2]),
	cloth: surface("tan cloth.png", 0xb8835d, 0.88, [2, 2]),
	oliveBark: surface("Olive tree bark.png", 0x665645, 0.9, [2, 2]),
	oliveLeaves: surface("olive leaf.png", 0xffffff, 0.76, [1, 1], {leaf: true}),
	metal: surface(null, 0x46545a, 0.62, [1, 1], {metalness: 0.3})
});

/** @param {string} yesodRole Semantic surface role. @returns {Readonly<object>|null} */
export function perutaSurfaceDefinition(yesodRole) {
	return SURFACE_DEFINITIONS[yesodRole] || null;
}

/**
 * Resolves an exact canonical filename through the registry's own search evidence.
 * @param {string|null} malchusFilename Exact canonical filename.
 * @returns {string|null} Trusted registry URL or null for fallback-only surfaces.
 */
export function resolvePerutaTextureUrl(malchusFilename) {
	if (!malchusFilename) return null;
	const tiferesMatches = searchAwtsmoosDriveTextures(malchusFilename);
	return tiferesMatches.find((entry) => entry.name === malchusFilename)?.url || null;
}

/** @returns {Array<string>} Registered semantic roles. */
export function perutaSurfaceRoles() {
	return Object.keys(SURFACE_DEFINITIONS);
}

/** @private */
function surface(filename, color, roughness, repeat, extra = {}) {
	return Object.freeze({
		filename,
		color,
		roughness,
		repeat: Object.freeze(repeat),
		metalness: extra.metalness || 0,
		leaf: Boolean(extra.leaf)
	});
}
