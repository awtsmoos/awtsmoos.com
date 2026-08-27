//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TemplePreferenceCatalog.js
 * @description Defines presentation preferences as immutable data so API validation, persistence, generated controls, localized CSS attributes, and Core quality budgets never maintain rival vocabularies.
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
 * @description Resolves one immutable preference descriptor while rejecting names outside the public presentation covenant before UI, persistence, or quality code can branch on invented vocabulary.
 * @param {string} binahKey Canonical preference key declared in `TEMPLE_PREFERENCES`.
 * @returns {Readonly<object>} Frozen preference descriptor containing type, default, copy, and optional enum values.
 * @throws {RangeError} When the requested preference key is not declared by the canonical catalog.
 */
export function revealTemplePreference(binahKey) {
	const binahPreference = TEMPLE_PREFERENCES[binahKey];
	if (!binahPreference) throw new RangeError(`Unknown Temple preference: ${binahKey}`);
	return binahPreference;
}

/**
 * @description Normalizes one external/UI preference value according to its declared Boolean or enum type while preserving an explicit fallback for rejected enum values.
 * @param {string} binahKey Canonical preference key whose descriptor controls normalization.
 * @param {unknown} malchusValue Requested public, persisted, or generated-control value.
 * @param {unknown} [malchusFallback] Optional fallback used when an enum value is outside its declared vocabulary.
 * @returns {boolean|string} Normalized presentation value compatible with the canonical preference schema.
 * @throws {TypeError} When a future catalog entry declares a type not implemented by this normalizer.
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
