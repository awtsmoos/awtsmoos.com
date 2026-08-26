// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunnerApi.js
 * @description Composes small command, knowledge, and presentation gates into one frozen public Temple Runner doorway whose method surface is generated from covenant data.
 * The Awtsmoos renews the many hidden Sefiros while Kesser presents one simple crown;
 * Awtsmoos.com lets beginners call `jump()` in peace while advanced callers may `describe()` the deeper structure beneath the town.
 */

import { DaasReadGate } from "./DaasReadGate.js";
import { KesserCommandGate } from "./KesserCommandGate.js";
import { MalchusPreferenceGate } from "./MalchusPreferenceGate.js";
import {
	TEMPLE_API_CAPABILITIES,
	TEMPLE_API_MANIFEST
} from "./TempleApiManifest.js";
import { revealTempleApiBindings } from "./YesodApiBindings.js";

export class KesserTempleRunnerApi {
	/**
	 * Builds the entire backward-compatible browser API from specialized gates, publishes immutable version/capability data, then freezes the finished doorway.
	 * Construction stores no mutable runtime graph on the public object: closures inside non-enumerable bound methods retain only the narrow gates they require.
	 * @param {object} olamRuntime Authoritative Temple Runner runtime graph.
	 * @param {object} malchusHud Clean HUD controller owning preferences and retractable detail.
	 */
	constructor(olamRuntime, malchusHud) {
		const kesserCommands = new KesserCommandGate(olamRuntime);
		const daasReads = new DaasReadGate(olamRuntime, malchusHud);
		const malchusPreferences = new MalchusPreferenceGate(malchusHud);
		this.version = TEMPLE_API_MANIFEST.version;
		this.capabilities = TEMPLE_API_CAPABILITIES;
		revealTempleApiBindings(
			this,
			kesserCommands,
			daasReads,
			malchusPreferences
		);
		Object.freeze(this);
	}
}
