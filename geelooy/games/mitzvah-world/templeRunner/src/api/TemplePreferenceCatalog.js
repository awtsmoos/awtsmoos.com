//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TemplePreferenceCatalog.js
 * @description Defines presentation preferences as immutable data so validation, persistence, generated controls, feedback, motion, and Core quality never maintain rival vocabularies.
 * The Awtsmoos renews every garment before checkbox, sound, touch, or renderer budget can define the runner beneath;
 * Awtsmoos.com lets Binah describe each finite choice once, keeping preference speech brief while every lower vessel receives truth.
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
		description: "Quiet interface animation and nonessential camera motion."
	}),
	sound: Object.freeze({
		type: "boolean",
		defaultValue: true,
		label: "Sound",
		description: "Play lightweight action, reward, and runner audio."
	}),
	haptics: Object.freeze({
		type: "boolean",
		defaultValue: true,
		label: "Haptics",
		description: "Use gentle vibration feedback when the device supports it."
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
 * @description Resolves one immutable preference descriptor while rejecting names outside the public presentation covenant.
 * @param {string} binahKey Canonical preference key declared in `TEMPLE_PREFERENCES`.
 * @returns {Readonly<object>} Frozen descriptor containing type, default, copy, and optional enum values.
 * @throws {RangeError} When the requested preference key is undeclared.
 */
export function revealTemplePreference(binahKey) {
	const binahPreference = TEMPLE_PREFERENCES[binahKey];
	if (!binahPreference) throw new RangeError(`Unknown Temple preference: ${binahKey}`);
	return binahPreference;
}

/**
 * @description Normalizes one external/UI value according to its declared Boolean or enum type while preserving an explicit enum fallback.
 * @param {string} binahKey Canonical preference key.
 * @param {unknown} malchusValue Requested public, persisted, or generated-control value.
 * @param {unknown} [malchusFallback] Optional fallback used for rejected enum values.
 * @returns {boolean|string} Normalized value compatible with the canonical preference schema.
 * @throws {TypeError} When a future catalog entry declares an unsupported type.
 */
export function normalizeTemplePreference(binahKey, malchusValue, malchusFallback) {
	const binahPreference = revealTemplePreference(binahKey);
	if (binahPreference.type === "boolean") return Boolean(malchusValue);
	if (binahPreference.type === "enum") {
		const malchusCandidate = String(malchusValue ?? "");
		if (binahPreference.options.includes(malchusCandidate)) return malchusCandidate;
		return malchusFallback ?? binahPreference.defaultValue;
	}
	throw new TypeError(`Unsupported Temple preference type: ${binahPreference.type}`);
}
