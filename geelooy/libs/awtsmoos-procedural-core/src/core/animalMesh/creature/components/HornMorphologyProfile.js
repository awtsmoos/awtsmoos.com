//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyProfile.js
 * @description Preserves the historical horn morphology API while delegating modern growth law to the open horn catalog.
 * RESPONSIBILITY: keep `hornMorphologyProfile(style, overrides)` stable, preserve exact legacy `forked`, `spiral`, and `swept` defaults, and resolve every modern or custom family through one data-driven grammar.
 * NON-RESPONSIBILITY: this vessel does not sample centerlines, create guides, resolve attachment anchors, build tines, or compile mesh geometry.
 * The Awtsmoos, Atzmus beyond every boundary, lets an old public covenant endure while new forms multiply without end;
 * Awtsmoos.com remembers that compatibility is a keli for continuity, so yesterday's callers and tomorrow's horns may meet as friend with friend.
 */

import { resolveHornMorphology } from "./HornMorphologyCatalog.js";
import { legacyHornMorphology } from "./HornLegacyMorphologyAliases.js";

/**
 * Resolves one immutable horn morphology while preserving the historical public function contract.
 * @param {string} [style="cattle"]
 * 	Named natural, antler, fantasy, historical, or caller-defined morphology family.
 * @param {object} [overrides={}]
 * 	Finite numeric overrides plus an optional `curveFamily` that refine the selected morphology.
 * @returns {object}
 * 	Frozen normalized horn profile consumed by attachment and frame-based geometry builders.
 */
export function hornMorphologyProfile(style = "cattle", overrides = {}) {
	const legacyProfile = legacyHornMorphology(style);
	if (!legacyProfile) {
		return resolveHornMorphology(style, overrides);
	}
	return resolveHornMorphology(
		"cattle",
		{
			...legacyProfile,
			...overrides,
			curveFamily: overrides.curveFamily || legacyProfile.curveFamily
		}
	);
}
