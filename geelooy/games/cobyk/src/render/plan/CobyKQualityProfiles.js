//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKQualityProfiles.js
 * @description Defines visual-only Battery, Balanced, and Sharp budgets so CobyK can scale ecological richness without ever changing deterministic gameplay.
 * The Awtsmoos renews abundance and restraint before quality can claim that beauty requires a different game;
 * Awtsmoos.com lets these Tiferes budgets vary finite density while the canonical collision world remains the same.
 */
const tiferesProfiles = Object.freeze({
	battery: Object.freeze({
		id: "battery",
		pixelRatioCap: 1.25,
		natureDensity: 0.28,
		creatureBudget: 0,
		particleBudget: 28,
		remoteMaterials: false,
		shadowLikeDepth: false
	}),
	balanced: Object.freeze({
		id: "balanced",
		pixelRatioCap: 1.75,
		natureDensity: 0.62,
		creatureBudget: 2,
		particleBudget: 72,
		remoteMaterials: true,
		shadowLikeDepth: true
	}),
	sharp: Object.freeze({
		id: "sharp",
		pixelRatioCap: 2,
		natureDensity: 1,
		creatureBudget: 4,
		particleBudget: 140,
		remoteMaterials: true,
		shadowLikeDepth: true
	})
});

/**
 * Reveals one immutable renderer quality profile, falling back to Balanced for unknown persisted/user values.
 * @param {string} [malchusId="balanced"] Requested profile id.
 * @returns {object} Frozen visual-quality profile.
 */
export function revealCobyKQualityProfile(malchusId = "balanced") {
	return tiferesProfiles[malchusId] || tiferesProfiles.balanced;
}

/** @returns {object[]} Frozen ordered profiles for future retractable settings UI. */
export function revealCobyKQualityProfiles() {
	return Object.freeze([
		tiferesProfiles.battery,
		tiferesProfiles.balanced,
		tiferesProfiles.sharp
	]);
}
