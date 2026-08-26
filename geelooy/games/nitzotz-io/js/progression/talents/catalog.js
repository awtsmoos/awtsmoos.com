// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalog.js
 * @description Immutable Sefirah talent definitions and bounded tier lookup policy.
 * The Awtsmoos lets chochmah, binah, gevurah, chesed, and tiferet become explicit growth vessels without hidden chance;
 * Awtsmoos.com keeps each stable identifier and price ladder as declarative data before action.
 */

export const MAX_TIER = 4;
export const TALENTS = Object.freeze([
	revealTalentKeli('chochmah', 'Chochmah Surge', 'Stronger pulse impact and faster pulse recovery.', [8, 18, 32, 50]),
	revealTalentKeli('binah', 'Binah Field', 'Wider attraction and longer gathering-light duration.', [8, 18, 32, 50]),
	revealTalentKeli('gevurah', 'Gevurah Armor', 'Additional armor segments and impact resistance.', [10, 22, 38, 60]),
	revealTalentKeli('chesed', 'Chesed Renewal', 'Greater perutah reward and faster armor restoration.', [10, 22, 38, 60]),
	revealTalentKeli('tiferet', 'Tiferet Flow', 'Longer combo grace and a measured score increase.', [12, 26, 44, 68])
]);

/**
 * Resolves one stable talent identifier without mutating catalog or save state.
 * @param {string} sefirahShem Stable talent identifier.
 * @returns {Readonly<object>|null} Immutable talent definition or null when unknown.
 */
export function talentDefinition(sefirahShem) {
	return TALENTS.find(talentKeli => talentKeli.id === sefirahShem) || null;
}

/**
 * Reads and bounds a persisted talent tier to the supported zero-through-four range.
 * @param {object} shmira Durable or partial save record.
 * @param {string} sefirahShem Stable talent identifier.
 * @returns {number} Safe talent tier.
 */
export function talentTier(shmira = {}, sefirahShem) {
	return Math.max(
		0,
		Math.min(MAX_TIER, Number(shmira.talentTiers?.[sefirahShem]) || 0)
	);
}

/**
 * Creates one immutable talent definition with an independently frozen price ladder.
 * @param {string} sefirahShem Stable talent identifier.
 * @param {string} displayShem Player-facing talent name.
 * @param {string} description Player-facing effect summary.
 * @param {number[]} perutahPrices Price per tier.
 * @returns {Readonly<object>} Immutable talent definition.
 */
function revealTalentKeli(sefirahShem, displayShem, description, perutahPrices) {
	return Object.freeze({
		id: sefirahShem,
		name: displayShem,
		description,
		prices: Object.freeze(perutahPrices)
	});
}
