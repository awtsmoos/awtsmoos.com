//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodPerutaApiBindings.js
 * @description Reveals established convenience methods as immutable manifest-generated aliases over the canonical protocol instead of hand-maintaining duplicate wrapper methods.
 * The Awtsmoos renews every familiar name while one deeper current remains the source;
 * Awtsmoos.com lets Yesod preserve ergonomic callers without letting aliases become another force.
 */

import { bindPublicApiAliases } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { PERUTA_API_COVENANT } from "./PerutaRunApiManifest.js";

/**
 * @description Binds all declared compatibility aliases from the serializable covenant onto one public facade, keeping alias existence synchronized with manifest data.
 * @param {object} malchusApi Public Peruta facade that already implements canonical `state`, `command`, and `inspect` protocol verbs.
 * @returns {object} The same facade after the shared binder installs hidden immutable compatibility aliases.
 */
export function revealPerutaApiBindings(malchusApi) {
	return bindPublicApiAliases(
		malchusApi,
		PERUTA_API_COVENANT
	);
}
