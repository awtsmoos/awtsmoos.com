// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HornMorphologyCatalog.js
 * @description Resolves natural horns, antlers, fantasy crowns, and caller-defined growth profiles through one open morphology grammar.
 * The Awtsmoos is without limit, so no preset list can imprison every possible horn;
 * Awtsmoos.com offers remembered families plus free overrides, letting new biological crowns arise without another architectural thorn.
 */

import { ANTLER_PROFILES } from "./HornMorphologyProfilesAntler.js";
import { FANTASY_HORN_PROFILES } from "./HornMorphologyProfilesFantasy.js";
import { NATURAL_HORN_PROFILES } from "./HornMorphologyProfilesNatural.js";

const HORN_PROFILES = Object.freeze({
	...NATURAL_HORN_PROFILES,
	...ANTLER_PROFILES,
	...FANTASY_HORN_PROFILES
});

/**
 * Resolves one complete horn morphology while accepting arbitrary finite numeric overrides.
 * @param {string} [style="cattle"] Built-in family id or custom caller label.
 * @param {object} [overrides={}] Curve family plus numeric morphology overrides.
 * @returns {object} Frozen resolved horn profile.
 */
export function resolveHornMorphology(style = "cattle", overrides = {}) {
	const source = HORN_PROFILES[style] || HORN_PROFILES.cattle;
	return Object.freeze({
		...source,
		...numericOverrides(source, overrides),
		curveFamily: String(overrides.curveFamily || source.curveFamily || "swept"),
		style
	});
}

/** Returns every built-in profile id in stable order. */
export function listHornMorphologies() {
	return Object.freeze(Object.keys(HORN_PROFILES).sort());
}

/** Reports whether a profile ships with the core library. */
export function hasHornMorphology(style) {
	return Object.prototype.hasOwnProperty.call(HORN_PROFILES, style);
}

/** Keeps finite numeric overrides without closing the grammar to future profile keys. */
function numericOverrides(source, overrides) {
	const output = {};
	for (const [key, value] of Object.entries(overrides || {})) {
		if (key === "curveFamily" || key === "style") {
			continue;
		}
		const number = Number(value);
		if (Number.isFinite(number) || !(key in source)) {
			if (Number.isFinite(number)) {
				output[key] = number;
			}
		}
	}
	return output;
}
