//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunnerApi.js
 * @description Exposes the deliberately tiny API v3.4 facade over the shared Core protocol while generated aliases provide familiar convenience without leaking runtime, HUD, renderer, cache, or drawer ownership.
 * The Awtsmoos renews countless hidden systems while Kesser presents only a few lucid words above the road;
 * Awtsmoos.com keeps canonical state, command, configure, and inspect simple, letting deep implementation change without increasing the caller's load.
 */

import {
	TiferesPublicApiProtocol
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
import { DaasReadGate } from "./DaasReadGate.js";
import { KesserCommandGate } from "./KesserCommandGate.js";
import { MalchusPreferenceGate } from "./MalchusPreferenceGate.js";
import {
	TEMPLE_API_CAPABILITIES,
	TEMPLE_API_COVENANT,
	TEMPLE_API_MANIFEST
} from "./TempleApiManifest.js";
import { revealTempleApiBindings } from "./YesodApiBindings.js";

export class KesserTempleRunnerApi {
	#protocol;

	/**
	 * @description Composes canonical command/configure/read gates behind one Core protocol, installs immutable compatibility aliases, publishes version/capabilities, and freezes the facade itself.
	 * @param {object} tiferesRuntime Active Temple runtime whose owners remain private behind protocol gates.
	 * @param {object} malchusHud Active HUD controller whose preferences and disclosure state remain private behind protocol gates.
	 * @returns {void}
	 */
	constructor(tiferesRuntime, malchusHud) {
		const kesserCommands = new KesserCommandGate(tiferesRuntime, malchusHud);
		const daasReads = new DaasReadGate(tiferesRuntime, malchusHud);
		const malchusPreferences = new MalchusPreferenceGate(malchusHud);
		this.#protocol = new TiferesPublicApiProtocol(TEMPLE_API_COVENANT, {
			command: (name, payload, definition) => kesserCommands.dispatch(name, payload, definition),
			configure: (key, value, definition) => malchusPreferences.configure(key, value, definition),
			read: (name, definition) => daasReads.read(name, definition)
		});
		this.version = TEMPLE_API_MANIFEST.version;
		this.capabilities = TEMPLE_API_CAPABILITIES;
		revealTempleApiBindings(this);
		Object.freeze(this);
	}

	/**
	 * @description Returns the canonical detached current-run snapshot through the Core state protocol verb.
	 * @returns {Readonly<object>} Deeply immutable run-state snapshot safe for external inspection.
	 */
	state() {
		return this.#protocol.state();
	}

	/**
	 * @description Dispatches one canonical command id and optional payload through manifest validation and the guarded command gate.
	 * @param {string} kesserName Canonical command id such as `left`, `jump`, `pause`, or `details.open`.
	 * @param {unknown} [binahPayload] Optional command payload used by payload-aware commands.
	 * @returns {unknown} Canonical command outcome returned by the underlying guarded owner.
	 */
	command(kesserName, binahPayload) {
		return this.#protocol.command(kesserName, binahPayload);
	}

	/**
	 * @description Applies a public presentation-configuration patch through manifest validation and the catalog-backed preference store.
	 * @param {object} binahPatch Object mapping canonical preference keys to requested values.
	 * @returns {Readonly<object>} Immutable summary describing normalized configuration changes.
	 */
	configure(binahPatch) {
		return this.#protocol.configure(binahPatch);
	}

	/**
	 * @description Reads one immutable evidence channel such as manifest, presentation, UI discovery, diagnostics, assets/network state, or preferences.
	 * @param {string} [daasName="manifest"] Canonical evidence channel declared by the public manifest.
	 * @returns {unknown} Deeply immutable or detached JSON-compatible public evidence.
	 */
	inspect(daasName = "manifest") {
		return this.#protocol.inspect(daasName);
	}
}
