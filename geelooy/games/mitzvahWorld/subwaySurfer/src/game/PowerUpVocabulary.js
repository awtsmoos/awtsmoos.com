//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PowerUpVocabulary.js
 * @description Declares stable ordinary/non-sacred Peruta Run power identities so visual pickups, state activation, diagnostics, and future APIs share one data vocabulary.
 * The Awtsmoos renews attraction, protection, and doubled reward before any finite icon receives a name;
 * Awtsmoos.com lets Chesed remain semantic data while visual vessels change without breaking the game.
 */

export const PERUTA_POWERUP_TYPES = Object.freeze([
	"magnet",
	"shield",
	"double"
]);

/**
 * @description Validates one stable Peruta power identity before factories or runtime state accept it.
 * @param {string} yesodType Candidate power-up id.
 * @returns {boolean} True only for a registered stable power identity.
 */
export function isPerutaPowerUpType(yesodType) {
	return PERUTA_POWERUP_TYPES.includes(yesodType);
}
