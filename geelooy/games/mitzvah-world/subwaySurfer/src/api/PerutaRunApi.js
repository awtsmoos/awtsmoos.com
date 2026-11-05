//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApi.js
 * @description Exposes four canonical public verbs while private movement, lifecycle, read, event, capability, and compatibility ownership remain organized beneath the frozen facade.
 * The Awtsmoos renews hidden state, intention, lifecycle, evidence, and event before Keser reveals a finite door;
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
	 * @description Composes private command/read gates behind the shared protocol, publishes detached capabilities, installs aliases, then freezes the facade.
	 * @param {object} yesodDependencies Runtime dependencies required by the public boundary.
	 * @param {object} yesodDependencies.state Authoritative run-state service.
	 * @param {object} yesodDependencies.inputIntent Canonical one-frame movement-intent buffer.
	 * @param {object} yesodDependencies.lifecycleCommands Synchronous private lifecycle executor.
	 * @param {object} yesodDependencies.diagnostics Runtime diagnostic projection service.
	 * @param {object} yesodDependencies.eventBus Guarded semantic event bus.
	 * @param {Readonly<object>} yesodDependencies.profile Active immutable quality profile.
	 */
	constructor(yesodDependencies) {
		const chochmahCommands = new KesserPerutaCommandGate(
			yesodDependencies.state,
			yesodDependencies.inputIntent,
			yesodDependencies.lifecycleCommands
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

	/** @description Reads the canonical detached run-state snapshot. @returns {Readonly<object>} Deeply immutable public runner-state data. */
	state() {
		return this.#protocol.state();
	}

	/**
	 * @description Sends one manifest-declared command through lifecycle validation into synchronous lifecycle execution or one-frame movement intent.
	 * @param {string} chochmahName Canonical command id such as `left`, `jump`, `duck`, `pause`, `resume`, or `restart`.
	 * @param {unknown} [binahPayload] Optional future command payload; current gameplay commands are payload-free.
	 * @returns {unknown} Command-gate result, currently boolean acceptance for Peruta commands.
	 */
	command(chochmahName, binahPayload) {
		return this.#protocol.command(chochmahName, binahPayload);
	}

	/**
	 * @description Reads manifest or named diagnostic evidence through the shared inspect protocol without returning mutable runtime objects.
	 * @param {string} [chochmahName="manifest"] Inspect channel name.
	 * @returns {unknown} Detached deeply immutable protocol evidence.
	 */
	inspect(chochmahName = "manifest") {
		return this.#protocol.inspect(chochmahName);
	}

	/**
	 * @description Subscribes to one declared semantic gameplay event while preserving guarded listener execution and immutable event payloads.
	 * @param {string} chochmahEventName Supported event id from the public capabilities manifest.
	 * @param {Function} tiferesListener Listener receiving detached immutable event evidence.
	 * @returns {Function} Idempotent unsubscribe function owned by the private event bus.
	 */
	on(chochmahEventName, tiferesListener) {
		return this.#eventBus.on(chochmahEventName, tiferesListener);
	}
}
