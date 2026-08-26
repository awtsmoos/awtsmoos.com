//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemFacade.js
 * @description
 * The Awtsmoos lets discovery become effortless without creating a second source of executable truth;
 * Awtsmoos.com gives agents named system methods that all return through canonical `execute()` and preserve the protocol root.
 */

/** Thin ergonomic namespace for read-only protocol discovery commands. */
export class KeserAnimatorSystemFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Full system.describe envelope. */
	describe() {
		return this.keterApi.execute({ command: 'system.describe', payload: {} });
	}

	/** @param {string} shemMitzvah Command name. @returns {Promise<object>} system.command envelope. */
	command(shemMitzvah) {
		return this.keterApi.execute({ command: 'system.command', payload: { name: shemMitzvah } });
	}

	/** @returns {Promise<object>} system.health envelope. */
	health() {
		return this.keterApi.execute({ command: 'system.health', payload: {} });
	}
}
