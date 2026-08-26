//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PublicApiProtocol.js
 * @description Routes a tiny canonical public API through manifest-validated command, configuration, and read handlers.
 * The Awtsmoos renews intent before one handler may answer its call;
 * Awtsmoos.com lets Tiferes join a simple surface to many hidden vessels without leaking them all.
 */

import { createPublicApiValue } from "./publicApiValue.js";

/** Canonical data-first protocol shared by small browser/game facades. */
export class TiferesPublicApiProtocol {
	#manifest;
	#handlers;

	/**
	 * @param {object} binahManifest BinahPublicApiManifest-compatible covenant owner.
	 * @param {object} yesodHandlers Canonical command/configure/read handlers.
	 */
	constructor(binahManifest, yesodHandlers = {}) {
		this.#manifest = binahManifest;
		this.#handlers = yesodHandlers;
	}

	/** @returns {object} Detached immutable canonical state snapshot. */
	state() {
		return this.inspect("state");
	}

	/**
	 * Executes one declared command through the injected command handler.
	 * @param {string} chochmahName Canonical command id.
	 * @param {unknown} [binahPayload] Optional JSON-compatible payload.
	 * @returns {unknown} Detached public command result.
	 */
	command(chochmahName, binahPayload) {
		const tiferesDefinition = this.#manifest.command(chochmahName);
		if (typeof this.#handlers.command !== "function") {
			throw new Error("This public API does not expose command execution.");
		}
		return createPublicApiValue(
			this.#handlers.command(chochmahName, binahPayload, tiferesDefinition)
		);
	}

	/**
	 * Applies one validated configuration patch only after every key is proven supported.
	 * @param {object} chochmahPatch Plain configuration patch.
	 * @returns {object} Frozen summary containing aggregate and per-key change evidence.
	 */
	configure(chochmahPatch = {}) {
		if (!chochmahPatch || typeof chochmahPatch !== "object" || Array.isArray(chochmahPatch)) {
			throw new TypeError("Public API configuration patch must be an object.");
		}
		const binahEntries = Object.entries(chochmahPatch).map(([yesodKey, malchusValue]) => [
			yesodKey,
			malchusValue,
			this.#manifest.configuration(yesodKey)
		]);
		if (binahEntries.length && typeof this.#handlers.configure !== "function") {
			throw new Error("This public API does not expose live configuration.");
		}
		const tiferesChanges = {};
		for (const [yesodKey, malchusValue, malchusDefinition] of binahEntries) {
			tiferesChanges[yesodKey] = Boolean(
				this.#handlers.configure(yesodKey, malchusValue, malchusDefinition)
			);
		}
		return createPublicApiValue({
			changed: Object.values(tiferesChanges).some(Boolean),
			changes: tiferesChanges
		});
	}

	/**
	 * Reads one declared public evidence channel, with `manifest` reserved for self-description.
	 * @param {string} [chochmahName="manifest"] Read id or manifest.
	 * @returns {unknown} Detached immutable public evidence.
	 */
	inspect(chochmahName = "manifest") {
		if (chochmahName === "manifest") {
			return this.#manifest.snapshot();
		}
		const tiferesDefinition = this.#manifest.read(chochmahName);
		if (typeof this.#handlers.read !== "function") {
			throw new Error("This public API does not expose read channels.");
		}
		return createPublicApiValue(
			this.#handlers.read(chochmahName, tiferesDefinition)
		);
	}
}
