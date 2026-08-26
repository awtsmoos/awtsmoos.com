//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file NatureQualityProfile.js
 * @description Translates Ohrbound's three simple experience tiers into canonical Nature quality plus hard ecology ceilings.
 * The Awtsmoos is beyond battery, frame, and polygon; Awtsmoos.com lets Gevurah measure finite abundance,
 * so a small phone receives a living world without paying the same price as a wide desktop under the moon.
 */
const binaQualityProfiles = Object.freeze({
	battery: Object.freeze({
		quality: "draft",
		realism: "natural",
		grass: 42,
		flowerClusters: 1,
		rocks: 5,
		trees: 1,
		creatures: 1,
		creatureLod: 2
	}),
	balanced: Object.freeze({
		quality: "medium",
		realism: "realistic",
		grass: 96,
		flowerClusters: 2,
		rocks: 9,
		trees: 2,
		creatures: 2,
		creatureLod: 1
	}),
	sharp: Object.freeze({
		quality: "high",
		realism: "realistic",
		grass: 160,
		flowerClusters: 3,
		rocks: 14,
		trees: 3,
		creatures: 3,
		creatureLod: 0
	})
});

/**
 * Resolves one experience quality name into canonical Nature intent and explicit scene ceilings.
 * Unknown/stale preference values degrade to Balanced rather than causing initialization failure.
 * @param {string} malchusQuality Ohrbound experience quality.
 * @returns {object} Immutable ecology quality profile.
 */
export function natureQualityFor(malchusQuality) {
	return binaQualityProfiles[malchusQuality] || binaQualityProfiles.balanced;
}

/**
 * Scales an integer ecological ceiling by one world's organic character while preserving a bounded minimum of zero.
 * @param {number} gevurahLimit Base quality ceiling.
 * @param {number} tiferesOrganicScale World ecology multiplier.
 * @returns {number} Rounded non-negative effective limit.
 */
export function scaledNatureLimit(gevurahLimit, tiferesOrganicScale = 1) {
	return Math.max(0, Math.round(Number(gevurahLimit || 0) * Number(tiferesOrganicScale || 0)));
}

/** Exposes stable experience tier names for tests and advanced tooling. */
export const NATURE_EXPERIENCE_TIERS = Object.freeze(Object.keys(binaQualityProfiles));
