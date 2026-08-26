//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeSeasonalAppearance.js
 * @description Maps existing deterministic season intent into renderer-neutral visibility and material guidance.
 * The Awtsmoos renews spring and winter without asking a wall clock when the leaf should fall;
 * Awtsmoos.com exposes appearance intent while canonical leaves and reproductive IDs remain one stable call.
 */

const PROFILES = Object.freeze({
	autumn: createProfile('autumn', 0.72, [1, 0.58, 0.28], 0.08, 0.82, [0.1, 0.12, 1]),
	evergreen: createProfile('evergreen', 1, [0.92, 1, 0.9], 0, 0.08, [0.4, 0.3, 0.65]),
	spring: createProfile('spring', 0.82, [0.72, 1, 0.68], -0.03, 0.05, [1, 1, 0.28]),
	summer: createProfile('summer', 1, [1, 1, 1], 0, 0.18, [0.35, 0.5, 0.75]),
	winter: createProfile('winter', 0.08, [0.58, 0.46, 0.34], 0.12, 1, [0.55, 0, 0.05])
});

/** Creates one immutable seasonal appearance profile. */
function createProfile(season, leafVisibility, tint, roughnessShift, senescence, reproduction) {
	return Object.freeze({
		leafTint: Object.freeze(tint),
		leafVisibility,
		reproductionVisibility: Object.freeze({
			bud: reproduction[0],
			flower: reproduction[1],
			fruit: reproduction[2]
		}),
		roughnessShift,
		season,
		senescence
	});
}

/** Returns stable appearance intent for the environment's already-normalized season. */
export function createTreeSeasonalAppearance(environment = {}) {
	return PROFILES[environment.season] || PROFILES.evergreen;
}
