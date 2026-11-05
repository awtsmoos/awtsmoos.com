//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodApiBindings.js
 * @description Reveals familiar non-enumerable Temple compatibility methods exclusively through the shared Core alias binder, ensuring ergonomic names never bypass canonical command/configure/read protocol law.
 * The Awtsmoos renews old name and canonical name before convenience can pretend to create another hall;
 * Awtsmoos.com lets Yesod preserve familiar speech while every method still descends through one guarded call.
 */

import {
	bindPublicApiAliases
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
import { TEMPLE_API_COVENANT } from "./TempleApiManifest.js";

/**
 * @description Binds every manifest-declared compatibility alias onto the public facade as an immutable wrapper over the canonical Core protocol.
 * @param {object} malchusApi Temple public facade that already implements `state`, `command`, `configure`, and `inspect`.
 * @returns {object} The same facade after all declared compatibility methods are installed.
 */
export function revealTempleApiBindings(malchusApi) {
	return bindPublicApiAliases(malchusApi, TEMPLE_API_COVENANT);
}
