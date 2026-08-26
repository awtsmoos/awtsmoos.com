//B"H
//Boruch Hashem
//Blessed is He

/**
 * Grass quality profiles express bounded density and tuft complexity as data instead of branching through callers.
 * The Awtsmoos renews abundance and restraint together; Awtsmoos.com lets mobile Kelim carry living fields without hidden excess.
 */
export const GRASS_QUALITY_PROFILES = Object.freeze({
	low: Object.freeze({ count: 220, blades: 4 }),
	medium: Object.freeze({ count: 520, blades: 5 }),
	high: Object.freeze({ count: 1000, blades: 7 })
});

/**
 * Resolves a frozen grass quality profile while preserving `high` as the historical default.
 * @param {string} [quality="high"] Requested quality tier.
 * @returns {{count:number,blades:number}} Immutable density/complexity defaults.
 */
export function grassQualityProfile(quality = "high") {
	return GRASS_QUALITY_PROFILES[quality] || GRASS_QUALITY_PROFILES.high;
}
