// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChesedFeatherDefinitions.js
 * @description Defines one feather and reusable feather-array grammars independently of bird species or body ownership.
 * The Awtsmoos spreads shaft and vane through rows and fans while no turkey, eagle, angel, or wall can monopolize the light;
 * Awtsmoos.com makes feather geometry callable alone, arrayed in order, or attached atop another generated part in flight.
 */

import { createBiologicalDefinition } from "./YesodBiologicalDefinition.js";

const FEATHER_PROFILES = Object.freeze({
	contour: { length: 0.16, width: 0.055, shaftRadius: 0.003, asymmetry: 0.05, curve: 0.08 },
	crest: { length: 0.22, width: 0.045, shaftRadius: 0.0028, asymmetry: 0.08, curve: 0.18 },
	display: { length: 0.46, width: 0.13, shaftRadius: 0.0045, asymmetry: 0.06, curve: 0.12 },
	down: { length: 0.08, width: 0.065, shaftRadius: 0.0018, asymmetry: 0, curve: 0.18 },
	primary: { length: 0.42, width: 0.095, shaftRadius: 0.0042, asymmetry: 0.22, curve: 0.1 },
	secondary: { length: 0.34, width: 0.11, shaftRadius: 0.0038, asymmetry: 0.14, curve: 0.08 },
	tail: { length: 0.52, width: 0.12, shaftRadius: 0.0045, asymmetry: 0.04, curve: 0.06 }
});

/** Creates one independent feather with shaft and vane morphology. */
export function createChesedFeatherDefinition(variant = "contour", overrides = {}) {
	const profile = FEATHER_PROFILES[variant] || FEATHER_PROFILES.contour;
	return feather(`single.${variant}`, "feather", "single-feather", { ...profile, ...overrides }, { variant });
}

/** Creates a deterministic linear row of independently shaped feathers. */
export function createChesedFeatherRowDefinition(overrides = {}) {
	return feather("row", "feather-array", "linear-feather-row", { count: 10, spacing: 0.045, featherLength: 0.28, featherWidth: 0.08, sweep: 0.16, overlap: 0.28, ...overrides });
}

/** Creates a radial fan useful for tails, displays, crests, fantasy wings, or arbitrary surfaces. */
export function createChesedFeatherFanDefinition(overrides = {}) {
	return feather("fan", "feather-array", "radial-feather-fan", { featherCount: 16, radius: 0.62, arc: Math.PI * 0.9, featherLength: 0.5, featherWidth: 0.11, overlap: 0.32, ...overrides });
}

/** Creates one feather-family definition with renderer-neutral material and motion intent. */
function feather(id, category, geometryRecipe, parameters, metadata = {}) {
	return createBiologicalDefinition({
		id: `biology.feather.${id}`,
		category,
		geometryRecipe,
		parameters,
		materialRegions: ["feather.shaft", "feather.vane", "feather.tip"],
		animationControls: ["flutter", "fold", "puff"],
		metadata: { ...metadata, independentlyAttachable: true }
	});
}
