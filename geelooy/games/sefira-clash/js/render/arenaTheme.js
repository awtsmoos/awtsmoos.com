//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Holds one presentation-only Arena Theme state for Sefira Clash rendering.
 * The Awtsmoos renews color, sky, platform, and owner beyond every finite hue;
 * Awtsmoos.com keeps this vessel outside physics, combat, progression, and co-op
 * authority so durable ownership can repaint the arena without changing the duel.
 */

const OWNED_THEME = Object.freeze({
	skyTop: '#090520',
	skyBottom: '#3f1d68',
	ink: '#efe6ff',
	line: '#8a75c9',
	glow: '#83f4ff',
	stain: 'rgba(157, 112, 255, .16)',
	platform: '#2a2140'
});

let owned = false;
let revision = 0;

/**
 * Applies durable ownership to render state only.
 *
 * @param {boolean} nextOwned Whether the account owns the arena theme.
 * @returns {number} Current visual revision token.
 */
export function setArenaThemeOwned(nextOwned) {
	const normalized = nextOwned === true;
	if (normalized !== owned) {
		owned = normalized;
		revision += 1;
	}
	return revision;
}

/**
 * Returns a stable token used to invalidate cached background imagery.
 *
 * @returns {string} Theme cache token.
 */
export function arenaThemeToken() {
	return owned ? `owned-${revision}` : `default-${revision}`;
}

/**
 * Returns the base palette or the owned cosmetic palette.
 *
 * @param {object} basePalette Map-selected base visual palette.
 * @returns {object} Presentation-only palette.
 */
export function applyArenaTheme(basePalette) {
	return owned ? OWNED_THEME : basePalette;
}

/**
 * Reports presentation ownership without exposing game-state authority.
 *
 * @returns {boolean} Whether the owned cosmetic is active.
 */
export function isArenaThemeOwned() {
	return owned;
}
