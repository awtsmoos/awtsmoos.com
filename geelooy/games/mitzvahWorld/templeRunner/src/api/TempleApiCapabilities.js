//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiCapabilities.js
 * @description Builds the public API-discovery snapshot from finalized manifest truth and shared semantic catalogs, including the focused asset/network evidence channel promised by API v3.4.
 * The Awtsmoos renews command, read, preference, feature, and asset before a caller can mistake discovery for ownership of the hidden hall;
 * Awtsmoos.com lets Chochmah publish one frozen map of every doorway while the deeper runtime remains concealed behind Tiferes law.
 */

import {
	createPublicApiValue
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
import { TEMPLE_ACTIONS } from "./TempleActionCatalog.js";
import { TEMPLE_PREFERENCES } from "./TemplePreferenceCatalog.js";

const PUBLIC_COMMAND_ORDER = Object.freeze([
	"left",
	"right",
	"jump",
	"slide",
	"pause",
	"resume",
	"restart"
]);

const PUBLIC_READ_ORDER = Object.freeze([
	"state",
	"presentation",
	"ui",
	"diagnostics",
	"assets",
	"preferences"
]);

/**
 * @description Creates the deeply immutable discovery surface consumed by developer tools, alternate shells, tests, and integrations without leaking manifest implementation objects.
 * @param {Readonly<object>} binahManifest Final Core-generated Temple API manifest snapshot containing feature flags and canonical protocol definitions.
 * @returns {Readonly<object>} Deeply immutable capability record containing command/read order, semantic action/preference catalogs, protocol verbs, and feature flags.
 */
export function revealTempleApiCapabilities(binahManifest) {
	return createPublicApiValue({
		commands: PUBLIC_COMMAND_ORDER,
		reads: PUBLIC_READ_ORDER,
		preferences: Object.keys(TEMPLE_PREFERENCES),
		actions: TEMPLE_ACTIONS,
		preferenceSchema: TEMPLE_PREFERENCES,
		protocol: ["state", "command", "configure", "inspect"],
		...binahManifest.features
	});
}
