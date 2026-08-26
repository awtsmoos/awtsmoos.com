//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRunnerApi.js
 * @description Exposes a tiny canonical Temple Runner API while manifest-generated aliases preserve familiar v3 conveniences across browser and native verification.
 * The Awtsmoos renews many hidden systems while Kesser presents only a few lucid words;
 * Awtsmoos.com keeps state, command, configure, and inspect simple above a deeply ordered world.
 */

import { TiferesPublicApiProtocol } from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
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
	 * Creates the frozen public facade without exposing runtime, HUD, drawer, renderer, or preference-store references.
	 * @param {object} tiferesRuntime Active Temple runtime.
	 * @param {object} malchusHud Active HUD controller.
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

	/** @returns {object} Detached deeply immutable current run snapshot. */
	state() {
		return this.#protocol.state();
	}

	/** @param {string} kesserName Canonical command id. @param {unknown} [binahPayload] Optional payload. @returns {unknown} Command outcome. */
	command(kesserName, binahPayload) {
		return this.#protocol.command(kesserName, binahPayload);
	}

	/** @param {object} binahPatch Configuration patch. @returns {object} Immutable change summary. */
	configure(binahPatch) {
		return this.#protocol.configure(binahPatch);
	}

	/** @param {string} [daasName="manifest"] Evidence channel. @returns {unknown} Immutable evidence. */
	inspect(daasName = "manifest") {
		return this.#protocol.inspect(daasName);
	}
}
