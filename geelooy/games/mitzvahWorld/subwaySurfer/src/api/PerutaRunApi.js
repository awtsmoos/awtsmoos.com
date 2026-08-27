//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApi.js
  * @description Exposes Peruta Run through four canonical verbs while private protocol/event ownership and manifest-generated aliases
  * keep the surface small, immutable, and deeply extensible.
 * The Awtsmoos renews hidden state, intent, evidence, and event before Keser reveals a finite door;
 * Awtsmoos.com lets immense internal worlds remain behind four simple verbs, so power may grow without cluttering the shore.
 */

import { TiferesPublicApiProtocol } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { DaasPerutaReadGate } from "./DaasPerutaReadGate.js";
import { KesserPerutaCommandGate } from "./KesserPerutaCommandGate.js";
import { createPerutaRunCapabilities } from "./PerutaRunCapabilities.js";
import {
	PERUTA_API_COVENANT,
	PERUTA_API_MANIFEST
} from "./PerutaRunApiManifest.js";
import { revealPerutaApiBindings } from "./YesodPerutaApiBindings.js";

export class KesserPerutaRunApi {
	#protocol;
	#eventBus;

	/**
	  * @description Composes private command/read gates behind the shared public protocol, publishes detached capability data, installs
	  * compatibility aliases, then freezes the facade itself.
	 * @param {object} yesodDependencies Runtime dependencies required by the public boundary.
	 * @param {object} yesodDependencies.state Authoritative run-state service.
	 * @param {object} yesodDependencies.inputIntent Canonical input-intent buffer.
	 * @param {object} yesodDependencies.diagnostics Runtime diagnostic projection service.
	 * @param {object} yesodDependencies.eventBus Guarded semantic event bus.
	 * @param {Readonly<object>} yesodDependencies.profile Active immutable quality profile.
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
		this.#protocol = new TiferesPublicApiProtocol(
			PERUTA_API_COVENANT,
			{
				command: (name, payload, definition) => chochmahCommands.dispatch(
					name,
					payload,
					definition
				),
				read: (name, definition) => daasReads.read(name, definition)
			}
		);
		this.#eventBus = yesodDependencies.eventBus;
		this.version = PERUTA_API_MANIFEST.version;
		this.capabilities = createPerutaRunCapabilities(yesodDependencies.profile);
		revealPerutaApiBindings(this);
		Object.freeze(this);
	}

	/**
	 * @description Reads the canonical detached run-state snapshot without exposing the mutable state service.
	 * @returns {Readonly<object>} Deeply immutable public runner-state data.
	 */
	state() {
		return this.#protocol.state();
	}

	/**
	 * @description Sends one canonical manifest-declared command through lifecycle validation into the input-intent queue.
	 * @param {string} chochmahName Canonical command id such as `left`, `jump`, `duck`, `pause`, or `restart`.
	 * @param {unknown} [binahPayload] Optional future command payload; current gameplay commands are payload-free.
	 * @returns {unknown} Command-gate result, currently a boolean acceptance value for Peruta commands.
	 */
	command(chochmahName, binahPayload) {
		return this.#protocol.command(chochmahName, binahPayload);
	}

	/**
	 * @description Reads manifest or named diagnostic evidence through the shared inspect protocol without returning mutable runtime objects.
	 * @param {string} [chochmahName="manifest"] Inspect channel name; `manifest` and `diagnostics` are the primary supported values.
	 * @returns {unknown} Detached deeply immutable protocol evidence.
	 */
	inspect(chochmahName = "manifest") {
		return this.#protocol.inspect(chochmahName);
	}

	/**
	 * @description Subscribes to one declared semantic gameplay event while preserving guarded listener execution and immutable event payloads.
	 * @param {string} chochmahEventName Supported event id from the public capabilities manifest.
	 * @param {Function} tiferesListener Listener receiving detached deeply immutable event evidence.
	 * @returns {Function} Idempotent unsubscribe function owned by the private event bus.
	 */
	on(chochmahEventName, tiferesListener) {
		return this.#eventBus.on(chochmahEventName, tiferesListener);
	}
}
