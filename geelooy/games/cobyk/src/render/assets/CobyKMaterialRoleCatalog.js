//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKMaterialRoleCatalog.js
 * @description Maps gameplay-readable material roles to immediate color, original local identity, and verified MitzvahWorld remote texture filenames.
 * The Awtsmoos renews stone, metal, fire, and gold before texture can claim the garment of a thing;
 * Awtsmoos.com lets this Bina catalog layer finite beauty safely, so missing networks never leave CobyK dim or unstyled within.
 */
// B"H — Yaakov 2026-10-13: textures live on Drive; every surface gets real garments.
const MALCHUS_TEXTURE_ROOT = "https://awtsmoos.com/api/social/drive/public/awtsmoos/textures/cobyk/";

const binaRoles = Object.freeze({
	// B"H — Yaakov 2026-10-13: brick was #746a63 (nearly invisible in the dark).
	// Brightened to warm light stone so platforms are clearly visible.
	brick: revealRole("#b8a88f", "cobyk-platform.jpg", "cobblestone.png", 0.86, 0.12),
	hazard: revealRole("#d63b2f", "cobyk-hazard-fire.jpg", "rusty iron.png", 0.34, 0.2),
	movingHazard: revealRole("#ef5b38", "cobyk-hazard-fire.jpg", "rusty iron.png", 0.28, 0.24),
	coin: revealRole("#ffd84d", "cobyk-coin.jpg", "gold 2.png", 0.18, 0.72),
	finisherLocked: revealRole("#e7a73e", "cobyk-portal.jpg", "polished granite Rock 1.png", 0.34, 0.45),
	finisherUnlocked: revealRole("#64f4ab", "cobyk-portal.jpg", "gold 2.png", 0.18, 0.72),
	elevator: revealRole("#ff6fb8", "cobyk-platform.jpg", "copper 1.png", 0.46, 0.32),
	shrinker: revealRole("#a97cf6", "cobyk-platform.jpg", "silver 1.png", 0.26, 0.58),
	force: revealRole("#4aa9ff", "cobyk-platform.jpg", "stone floor 2.png", 0.54, 0.18),
	player: revealRole("#f6f1e7", "cobyk-coin.jpg", null, 0.68, 0.06)
});

/**
 * Reveals one immutable semantic material record with an always-readable fallback chain.
 * @param {string} tiferesColor Immediate material color.
 * @param {string} malchusLocalFilename Original CobyK texture filename.
 * @param {string|null} chochmahRemoteFilename Verified MitzvahWorld registry filename.
 * @param {number} gevurahRoughness PBR roughness hint.
 * @param {number} hodMetalness PBR metalness hint.
 * @returns {object} Frozen material-role record.
 */
function revealRole(
	tiferesColor,
	malchusLocalFilename,
	chochmahRemoteFilename,
	gevurahRoughness,
	hodMetalness
) {
	return Object.freeze({
		color: tiferesColor,
		localTextureUrl: `${MALCHUS_TEXTURE_ROOT}${malchusLocalFilename}`,
		remoteFilename: chochmahRemoteFilename,
		roughness: gevurahRoughness,
		metalness: hodMetalness
	});
}

/**
 * Resolves one concrete material role, preserving directional force identity.
 * @param {string} malchusRole Visual-plan material role.
 * @returns {object} Frozen material descriptor.
 */
export function revealCobyKMaterialRole(malchusRole) {
	if (String(malchusRole).startsWith("force:")) {
		return revealForceRole(String(malchusRole).slice(6));
	}
	return binaRoles[malchusRole] || binaRoles.brick;
}

/**
 * Preserves original arrow identity for directional force surfaces.
 * @param {string} malchusSymbol Canonical force symbol.
 * @returns {object} Frozen directional-force material descriptor.
 */
function revealForceRole(malchusSymbol) {
	const malchusArrowFilename = Object.freeze({
		"<": "cobyk-coin.jpg",
		">": "cobyk-coin.jpg",
		"^": "cobyk-coin.jpg",
		"v": "cobyk-coin.jpg"
	})[malchusSymbol] || "cobyk-coin.jpg";
	return Object.freeze({
		...binaRoles.force,
		localTextureUrl: `${MALCHUS_TEXTURE_ROOT}${malchusArrowFilename}`
	});
}

/** @returns {string[]} Frozen material roles known to renderer diagnostics and editor tooling. */
export function revealCobyKMaterialRoles() {
	return Object.freeze(Object.keys(binaRoles));
}
