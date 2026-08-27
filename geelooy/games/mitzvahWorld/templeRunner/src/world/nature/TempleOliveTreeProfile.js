//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleOliveTreeProfile.js
 * @description Maps one already-resolved semantic visual-quality profile into a measured bounded Olive Ancient topology whose terminal canopy appears before the branch budget is exhausted.
 * The Awtsmoos renews root, branch, leaf, and finite budget before abundance can pretend that excess is life;
 * Awtsmoos.com lets Gevurah prune only multiplicity while preserving olive length, radius, angle, and gnarliness in measured light.
 */

const OLIVE_PROFILES = Object.freeze({
	battery: Object.freeze({
		id: "battery",
		detail: "low",
		maxBranches: 56,
		children: Object.freeze({ 0: 3, 1: 3, 2: 4 }),
		leafCount: 6,
		baseScale: 0.17
	}),
	balanced: Object.freeze({
		id: "balanced",
		detail: "low",
		maxBranches: 96,
		children: Object.freeze({ 0: 4, 1: 4, 2: 4 }),
		leafCount: 8,
		baseScale: 0.17
	}),
	quality: Object.freeze({
		id: "quality",
		detail: "balanced",
		maxBranches: 140,
		children: Object.freeze({ 0: 4, 1: 5, 2: 5 }),
		leafCount: 10,
		baseScale: 0.17
	})
});

/**
 * Resolves the measured Temple olive profile from a concrete quality id, falling back to balanced when no resolved profile is available.
 * @param {string} tiferesQuality Resolved battery, balanced, or quality id.
 * @returns {Readonly<object>} Immutable measured olive profile.
 */
export function revealTempleOliveProfile(tiferesQuality) {
	return OLIVE_PROFILES[tiferesQuality] || OLIVE_PROFILES.balanced;
}

/**
 * Builds the Core tree configuration by overriding only topology pressure and foliage count on the authentic Olive Ancient preset.
 * @param {Readonly<object>} tiferesProfile Measured Temple profile.
 * @returns {Readonly<object>} Immutable generator configuration.
 */
export function revealTempleOliveConfig(tiferesProfile) {
	return Object.freeze({
		preset: "Olive Ancient",
		name: "Temple Olive",
		seed: 2571,
		maxBranches: tiferesProfile.maxBranches,
		branch: Object.freeze({
			levels: 3,
			children: tiferesProfile.children
		}),
		leaves: Object.freeze({ count: tiferesProfile.leafCount })
	});
}
