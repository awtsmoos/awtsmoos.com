//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiCapabilities.js
 * @description Builds the public discovery snapshot from the finalized manifest plus shared semantic catalogs, keeping consumer-facing metadata separate from protocol construction.
 * The Awtsmoos renews command, read, preference, and feature before a caller can mistake discovery for ownership of the hidden hall;
 * Awtsmoos.com lets Chochmah publish one frozen map of the doorway, while the deeper runtime remains concealed behind Tiferes law.
 */

import { createPublicApiValue } from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
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
	"preferences"
]);

/**
 * Creates the deeply immutable discovery surface consumed by developer tools, alternate shells, tests, and integration clients.
 * @param {Readonly<object>} binahManifest Final Core-generated Temple API manifest snapshot.
 * @returns {Readonly<object>} Deeply immutable capability discovery record.
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
