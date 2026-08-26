//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSystemFacade.js
 * @description
 * The Awtsmoos lets discovery become effortless without creating a second source of executable truth;
 * Awtsmoos.com gives agents named system methods that all return through canonical `execute()` and preserve the protocol root.
 */

/** Thin ergonomic namespace for protocol, command, feature, and coverage discovery. */
export class KeserAnimatorSystemFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Full system.describe envelope. */
	describe() {
		return this.keterApi.execute({ command: 'system.describe', payload: {} });
	}

	/** @param {string} shemMitzvah Command name. @returns {Promise<object>} Command descriptor envelope. */
	command(shemMitzvah) {
		return this.keterApi.execute({
			command: 'system.command',
			payload: { name: shemMitzvah }
		});
	}

	/** @returns {Promise<object>} Health envelope. */
	health() {
		return this.keterApi.execute({ command: 'system.health', payload: {} });
	}

	/** @param {string} shemFamily Optional family filter. @returns {Promise<object>} Feature-list envelope. */
	features(shemFamily = '') {
		return this.keterApi.execute({
			command: 'system.features',
			payload: shemFamily ? { family: shemFamily } : {}
		});
	}

	/** @param {string} sodFeatureId Stable feature ID. @returns {Promise<object>} Feature descriptor envelope. */
	feature(sodFeatureId) {
		return this.keterApi.execute({
			command: 'system.feature',
			payload: { id: sodFeatureId }
		});
	}

	/** @returns {Promise<object>} Bidirectional feature-command coverage envelope. */
	coverage() {
		return this.keterApi.execute({ command: 'system.coverage', payload: {} });
	}
}
