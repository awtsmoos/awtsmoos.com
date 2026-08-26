//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunnerApi.js
 * @description Exposes a tiny canonical Temple Runner browser API while manifest-generated aliases preserve every familiar v3 convenience method.
 * The Awtsmoos renews many hidden systems while Keser presents only a few lucid words;
 * Awtsmoos.com keeps state, command, configure, and inspect simple above a deeply ordered world.
 */

import { TiferesPublicApiProtocol } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { DaasReadGate } from "./DaasReadGate.js";
import { KesserCommandGate } from "./KesserCommandGate.js";
import { MalchusPreferenceGate } from "./MalchusPreferenceGate.js";
import {
	TEMPLE_API_CAPABILITIES,
	TEMPLE_API_COVENANT,
	TEMPLE_API_MANIFEST
} from "./TempleApiManifest.js";
import { revealTempleApiBindings } from "./YesodApiBindings.js";

/** Frozen canonical Temple Runner facade with compatibility aliases generated from one covenant. */
export class KesserTempleRunnerApi {
	#protocol;

	/**
	 * Creates the public facade without exposing runtime, HUD, drawer, or preference store references.
	 * @param {object} tiferesRuntime Active Temple runtime.
	 * @param {object} malchusHud HUD controller.
	 */
	constructor(tiferesRuntime, malchusHud) {
		const chochmahCommands = new KesserCommandGate(tiferesRuntime, malchusHud);
		const binahReads = new DaasReadGate(tiferesRuntime, malchusHud);
		const malchusPreferences = new MalchusPreferenceGate(malchusHud);
		this.#protocol = new TiferesPublicApiProtocol(TEMPLE_API_COVENANT, {
			command: (name, payload, definition) => chochmahCommands.dispatch(name, payload, definition),
			configure: (key, value, definition) => malchusPreferences.configure(key, value, definition),
			read: (name, definition) => binahReads.read(name, definition)
		});
		this.version = TEMPLE_API_MANIFEST.version;
		this.capabilities = TEMPLE_API_CAPABILITIES;
		revealTempleApiBindings(this);
		Object.freeze(this);
	}

	/** @returns {object} Detached deeply immutable current run snapshot. */
	state() {
		return this.#protocol.state();
	}

	/** @param {string} chochmahName Canonical command id. @param {unknown} [binahPayload] Payload. @returns {unknown} */
	command(chochmahName, binahPayload) {
		return this.#protocol.command(chochmahName, binahPayload);
	}

	/** @param {object} chochmahPatch Configuration patch. @returns {object} Immutable change summary. */
	configure(chochmahPatch) {
		return this.#protocol.configure(chochmahPatch);
	}

	/** @param {string} [chochmahName="manifest"] Evidence channel. @returns {unknown} Immutable evidence. */
	inspect(chochmahName = "manifest") {
		return this.#protocol.inspect(chochmahName);
	}
}
