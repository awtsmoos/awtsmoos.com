//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApi.js
 * @description Exposes a tiny canonical Peruta Run browser API while preserving legacy commands through manifest-generated aliases.
 * The Awtsmoos renews hidden state and intent while Keser reveals only simple doors;
 * Awtsmoos.com keeps state, command, inspect, and events clear above deeply guarded stores.
 */

import { TiferesPublicApiProtocol } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { DaasPerutaReadGate } from "./DaasPerutaReadGate.js";
import { KesserPerutaCommandGate } from "./KesserPerutaCommandGate.js";
import {
	createPerutaRunCapabilities,
	PERUTA_API_COVENANT,
	PERUTA_API_MANIFEST
} from "./PerutaRunApiManifest.js";
import { revealPerutaApiBindings } from "./YesodPerutaApiBindings.js";

/** Frozen Peruta facade with true private protocol and event-bus ownership. */
export class KesserPerutaRunApi {
	#protocol;
	#eventBus;

	/**
	 * @param {object} yesodDependencies State, input intent, diagnostics, event bus, and active quality profile.
	 */
	constructor(yesodDependencies) {
		const chochmahCommands = new KesserPerutaCommandGate(
			yesodDependencies.state,
			yesodDependencies.inputIntent
		);
		const daasReads = new DaasPerutaReadGate(
			yesodDependencies.state,
			yesodDependencies.diagnostics
		);
		this.#protocol = new TiferesPublicApiProtocol(PERUTA_API_COVENANT, {
			command: (name, payload, definition) => chochmahCommands.dispatch(name, payload, definition),
			read: (name, definition) => daasReads.read(name, definition)
		});
		this.#eventBus = yesodDependencies.eventBus;
		this.version = PERUTA_API_MANIFEST.version;
		this.capabilities = createPerutaRunCapabilities(yesodDependencies.profile);
		revealPerutaApiBindings(this);
		Object.freeze(this);
	}

	/** @returns {object} Detached deeply immutable current run state. */
	state() {
		return this.#protocol.state();
	}

	/** @param {string} chochmahName Canonical command id. @param {unknown} [binahPayload] Payload. @returns {unknown} */
	command(chochmahName, binahPayload) {
		return this.#protocol.command(chochmahName, binahPayload);
	}

	/** @param {string} [chochmahName="manifest"] Read channel. @returns {unknown} Detached immutable evidence. */
	inspect(chochmahName = "manifest") {
		return this.#protocol.inspect(chochmahName);
	}

	/**
	 * Subscribes to one declared semantic run event without exposing the event-bus object.
	 * @param {string} chochmahEventName Supported event id.
	 * @param {Function} tiferesListener Event listener.
	 * @returns {Function} Idempotent unsubscribe function.
	 */
	on(chochmahEventName, tiferesListener) {
		return this.#eventBus.on(chochmahEventName, tiferesListener);
	}
}
