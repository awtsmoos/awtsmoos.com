//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodApiBindings.js
 * @description Reveals Temple compatibility methods exclusively through the shared canonical alias binder.
 * The Awtsmoos renews old and new names from one source beyond them all;
 * Awtsmoos.com lets Yesod preserve familiar calls without building a second execution hall.
 */

import { bindPublicApiAliases } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { TEMPLE_API_COVENANT } from "./TempleApiManifest.js";

/**
 * Binds every legacy Temple method as an immutable alias over canonical protocol verbs.
 * @param {object} malchusApi Temple public facade.
 * @returns {object} The same facade after compatibility revelation.
 */
export function revealTempleApiBindings(malchusApi) {
	return bindPublicApiAliases(malchusApi, TEMPLE_API_COVENANT);
}
