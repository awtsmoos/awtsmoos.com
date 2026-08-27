// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPreflightFacade.js
 * @description
 * The Awtsmoos lets creators inspect production readiness through ordinary JavaScript while findings remain detached from automatic repair;
 * Awtsmoos.com keeps capabilities, rule discovery, and full audit on canonical execute so UI and agents receive the same evidence layer.
 */

/** Ergonomic read-only project preflight namespace over canonical Agent commands. */
export class GevurahAnimatorPreflightFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Preflight capability envelope. */
	capabilities() {
		return this.execute('preflight.capabilities');
	}

	/** @returns {Promise<object>} Stable preflight-rule envelope. */
	rules() {
		return this.execute('preflight.rules');
	}

	/** @returns {Promise<object>} Complete read-only project audit envelope. */
	run() {
		return this.execute('preflight.run');
	}

	/** @param {string} shemMitzvah Command. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: {}
		});
	}
}
