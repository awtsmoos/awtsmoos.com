// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AgentReceipt.js
 * @description
 * The Awtsmoos renews an action and also its witness; Awtsmoos.com gives agents
 * a small immutable receipt so generated scenes and performances can be traced,
 * serialized, tested, and handed to the next tool without hidden browser state.
 */
export class AgentReceipt {
	/**
	 * Builds a successful command receipt from JSON-safe values.
	 *
	 * @param {string} version - Public API version.
	 * @param {string} command - Executed command name.
	 * @param {*} result - Serializable command result.
	 * @param {string[]} [warnings=[]] - Nonfatal diagnostic notes.
	 */
	constructor(version, command, result, warnings = []) {
		this.ok = true;
		this.version = String(version);
		this.command = String(command);
		this.result = result;
		this.warnings = [...warnings];
	}

	/**
	 * Returns a fresh JSON-shaped vessel so callers cannot mutate internal arrays.
	 *
	 * @returns {{ok:boolean, version:string, command:string, result:*, warnings:string[]}}
	 */
	toJSON() {
		return {
			ok: this.ok,
			version: this.version,
			command: this.command,
			result: this.result,
			warnings: [...this.warnings]
		};
	}
}
