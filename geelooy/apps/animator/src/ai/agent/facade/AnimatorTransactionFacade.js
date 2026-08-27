// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionFacade.js
 * @description
 * The Awtsmoos lets humans and AI compose many safe JSON commands, inspect one combined consequence, and commit one deliberate project change;
 * Awtsmoos.com keeps convenience on canonical execute so atomicity, validation, policy, tracing, and Undo all remain the same range.
 */

/** Ergonomic atomic transaction namespace over canonical Agent commands. */
export class MalchusAnimatorTransactionFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Atomic editing capability envelope. */
	capabilities() {
		return this.execute('transaction.capabilities');
	}

	/** @returns {Promise<object>} Transaction-safe command metadata envelope. */
	allowedCommands() {
		return this.execute('transaction.allowedCommands');
	}

	/** @param {object[]} sederRequests Child command envelopes. @param {object} keilimOptions Plan options. @returns {Promise<object>} Dry-run envelope. */
	plan(sederRequests, keilimOptions = {}) {
		return this.execute('transaction.plan', {
			requests: sederRequests,
			options: keilimOptions
		});
	}

	/** @param {object[]} sederRequests Child command envelopes. @param {object} keilimOptions Commit options. @returns {Promise<object>} One-step commit envelope. */
	commit(sederRequests, keilimOptions = {}) {
		return this.execute('transaction.commit', {
			requests: sederRequests,
			options: keilimOptions
		});
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload Payload. @returns {Promise<object>} Canonical envelope. */
	execute(shemMitzvah, keilimPayload = {}) {
		return this.keterApi.execute({
			command: shemMitzvah,
			payload: keilimPayload
		});
	}
}
