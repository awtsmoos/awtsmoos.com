//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PublicApiManifest.js
 * @description Owns the serializable covenant behind a small public API without mixing executable handlers into discovery data.
 * The Awtsmoos renews every public name before command and implementation can meet;
 * Awtsmoos.com lets Binah guard aliases and channels so one covenant stays complete.
 */

import { createPublicApiValue } from "./publicApiValue.js";

const VALID_ALIAS_CHANNELS = new Set(["command", "configure", "inspect", "state"]);

/** Serializable manifest vessel for command, configuration, read, alias, and feature discovery. */
export class BinahPublicApiManifest {
	#covenant;

	/**
	 * Validates and seals one plain serializable public API covenant.
	 * @param {object} chochmahCovenant Raw manifest data.
	 */
	constructor(chochmahCovenant = {}) {
		this.assertCovenant(chochmahCovenant);
		this.#covenant = createPublicApiValue({
			version: chochmahCovenant.version,
			commands: chochmahCovenant.commands ?? {},
			configuration: chochmahCovenant.configuration ?? {},
			reads: chochmahCovenant.reads ?? {},
			aliases: chochmahCovenant.aliases ?? {},
			features: chochmahCovenant.features ?? {}
		});
		this.validateAliases();
	}

	/** @returns {object} Deeply frozen serializable manifest snapshot. */
	snapshot() {
		return this.#covenant;
	}

	/** @param {string} chochmahName Command id. @returns {object} Frozen command definition. */
	command(chochmahName) {
		return this.requireDefinition("commands", chochmahName);
	}

	/** @param {string} chochmahKey Configuration key. @returns {object} Frozen configuration definition. */
	configuration(chochmahKey) {
		return this.requireDefinition("configuration", chochmahKey);
	}

	/** @param {string} chochmahName Read id. @returns {object} Frozen read definition. */
	read(chochmahName) {
		return this.requireDefinition("reads", chochmahName);
	}

	/** @param {string} chochmahName Alias name. @returns {object} Frozen alias definition. */
	alias(chochmahName) {
		return this.requireDefinition("aliases", chochmahName);
	}

	/** @param {object} chochmahCovenant Candidate raw covenant. @returns {void} */
	assertCovenant(chochmahCovenant) {
		if (!chochmahCovenant || typeof chochmahCovenant !== "object" || Array.isArray(chochmahCovenant)) {
			throw new TypeError("Public API manifest must be a plain object.");
		}
		if (typeof chochmahCovenant.version !== "string" || !chochmahCovenant.version.trim()) {
			throw new TypeError("Public API manifest requires a non-empty version.");
		}
	}

	/** Ensures every declared compatibility alias targets a real canonical channel. @returns {void} */
	validateAliases() {
		for (const [yesodName, yesodAlias] of Object.entries(this.#covenant.aliases)) {
			if (!VALID_ALIAS_CHANNELS.has(yesodAlias.channel)) {
				throw new TypeError(`Unsupported API alias channel for ${yesodName}: ${yesodAlias.channel}`);
			}
			this.validateAliasTarget(yesodName, yesodAlias);
		}
	}

	/** @param {string} yesodName Alias name. @param {object} yesodAlias Alias definition. @returns {void} */
	validateAliasTarget(yesodName, yesodAlias) {
		if (yesodAlias.channel === "state") return;
		const binahChannel = yesodAlias.channel === "configure"
			? "configuration"
			: yesodAlias.channel === "inspect"
				? "reads"
				: "commands";
		if (yesodAlias.target === "manifest" && yesodAlias.channel === "inspect") return;
		if (!Object.hasOwn(this.#covenant[binahChannel], yesodAlias.target)) {
			throw new RangeError(`API alias ${yesodName} targets unknown ${binahChannel} entry: ${yesodAlias.target}`);
		}
	}

	/** @param {string} binahChannel Manifest channel. @param {string} chochmahName Entry id. @returns {object} */
	requireDefinition(binahChannel, chochmahName) {
		const tiferesDefinition = this.#covenant[binahChannel]?.[chochmahName];
		if (!tiferesDefinition) {
			throw new RangeError(`Unknown public API ${binahChannel} entry: ${chochmahName}`);
		}
		return tiferesDefinition;
	}
}
