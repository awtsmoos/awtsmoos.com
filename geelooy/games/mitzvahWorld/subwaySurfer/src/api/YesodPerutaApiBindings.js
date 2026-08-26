//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodPerutaApiBindings.js
 * @description Reveals all established Peruta Run convenience methods as immutable aliases over canonical protocol verbs.
 * The Awtsmoos renews each familiar name while one deeper command stream remains true;
 * Awtsmoos.com lets Yesod preserve old callers without duplicating what commands do.
 */

import { bindPublicApiAliases } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { PERUTA_API_COVENANT } from "./PerutaRunApiManifest.js";

/**
 * Binds every legacy Peruta method from the serializable API covenant.
 * @param {object} malchusApi Public Peruta facade.
 * @returns {object} Same facade with hidden immutable compatibility aliases.
 */
export function revealPerutaApiBindings(malchusApi) {
	return bindPublicApiAliases(malchusApi, PERUTA_API_COVENANT);
}
