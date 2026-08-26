//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TemplePreferenceCatalog.js
 * @description Defines presentation preferences as immutable data so API validation, persistence, generated controls, CSS attributes, and Core quality budgets never maintain rival vocabularies.
 * The Awtsmoos renews every garment before checkbox, select, or renderer budget can define the runner beneath;
 * Awtsmoos.com lets Binah describe each finite choice once, keeping advanced preference deep while interface speech remains brief.
 */

import { TEMPLE_QUALITY_OPTIONS } from "../realism/TempleQualityProfiles.js";

export const TEMPLE_PREFERENCES = Object.freeze({
	fx: Object.freeze({
		type: "boolean",
		defaultValue: true,
		label: "Atmosphere FX",
		description: "Subtle particles and environmental flourish."
	}),
	reducedMotion: Object.freeze({
		type: "boolean",
		defaultValue: false,
		label: "Reduced motion",
		description: "Quiet nonessential interface animation."
	}),
	controls: Object.freeze({
		type: "boolean",
		defaultValue: true,
		label: "Action buttons",
		description: "Show the thumb-friendly movement tray."
	}),
	hudDensity: Object.freeze({
		type: "enum",
		defaultValue: "balanced",
		label: "HUD density",
		description: "Choose balanced detail or a quieter minimal HUD.",
		options: Object.freeze(["balanced", "minimal"])
	}),
	qualityProfile: Object.freeze({
		type: "enum",
		defaultValue: "auto",
		label: "Visual quality",
		description: "Tune Core textures and atmosphere with one semantic profile.",
		options: TEMPLE_QUALITY_OPTIONS
	})
});

/**
 * Returns one preference descriptor while rejecting names outside the public presentation covenant.
 * @param {string} binahKey Canonical preference key.
 * @returns {Readonly<object>} Frozen preference descriptor.
 */
export function revealTemplePreference(binahKey) {
	const preference = TEMPLE_PREFERENCES[binahKey];
	if (!preference) throw new RangeError(`Unknown Temple preference: ${binahKey}`);
	return preference;
}

/**
 * Normalizes a public preference value using its declared type and allowed option vocabulary.
 * @param {string} binahKey Canonical preference key.
 * @param {unknown} malchusValue Requested value.
 * @param {unknown} [fallbackValue] Optional normalization fallback.
 * @returns {boolean|string} Normalized presentation value.
 */
export function normalizeTemplePreference(binahKey, malchusValue, fallbackValue) {
	const preference = revealTemplePreference(binahKey);
	if (preference.type === "boolean") return Boolean(malchusValue);
	if (preference.type === "enum") {
		const candidate = String(malchusValue ?? "");
		if (preference.options.includes(candidate)) return candidate;
		return fallbackValue ?? preference.defaultValue;
	}
	throw new TypeError(`Unsupported Temple preference type: ${preference.type}`);
}
