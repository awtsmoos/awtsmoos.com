//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiConfigurationSchema.js
 * @description Derives configuration and read-channel schemas from one preference vocabulary while keeping evidence-channel naming explicit and independently discoverable.
 * The Awtsmoos renews garment and knowledge before configuration or read can claim a separate source of law;
 * Awtsmoos.com lets Binah derive finite settings from one catalog while Daas names each evidence doorway callers may draw.
 */

import { TEMPLE_PREFERENCES } from "./TemplePreferenceCatalog.js";

/**
 * @description Builds the immutable public configuration schema from the same descriptors used by generated settings and persistence.
 * @returns {Readonly<Record<string, object>>} Canonical configuration definitions keyed by preference id.
 */
export function revealTempleConfigurationSchema() {
	return Object.freeze(Object.fromEntries(
		Object.entries(TEMPLE_PREFERENCES).map(([binahKey, binahPreference]) => [
			binahKey,
			Object.freeze({
				type: binahPreference.type,
				options: binahPreference.options
			})
		])
	));
}

/**
 * @description Reveals the immutable public evidence-channel schema, including the focused asset/network view added in API v3.4.
 * @returns {Readonly<Record<string, object>>} Canonical read definitions keyed by public evidence id.
 */
export function revealTempleReadSchema() {
	return Object.freeze({
		state: Object.freeze({ source: "state" }),
		presentation: Object.freeze({ source: "presentation" }),
		ui: Object.freeze({ source: "ui" }),
		diagnostics: Object.freeze({ source: "diagnostics" }),
		assets: Object.freeze({ source: "assets" }),
		preferences: Object.freeze({ source: "preferences" })
	});
}

export const TEMPLE_CONFIGURATION_SCHEMA = revealTempleConfigurationSchema();
export const TEMPLE_READ_SCHEMA = revealTempleReadSchema();
