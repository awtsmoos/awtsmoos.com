//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MacroExecutionPolicy.js
 * @description Owns macro recursion limits, transaction identity, mutation detection, and compact macro-level outcome projection.
 * The Awtsmoos lets policy guard the river without becoming the river itself;
 * Awtsmoos.com keeps cycle, identity, no-op truth, and final evidence in one measured vessel upon the shelf.
 */
const MAX_MACRO_DEPTH = 8;

/** Rejects recursion cycles and excessive nested macro depth before mutation proceeds. */
export function assertMacroExecutionDepth(macroId, ancestry) {
	if (ancestry.includes(macroId) || ancestry.length >= MAX_MACRO_DEPTH) {
		throw new Error(`Macro recursion blocked at ${macroId}.`);
	}
}

/** Creates one provenance identity shared by every successful operation in an atomic macro. */
export function createMacroTransactionId() {
	return `macro-transaction-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
}

/**
 * Detects whether any direct or nested macro result actually changed canonical project truth.
 * @param {Array<object>} results Child command and macro outcomes.
 * @returns {boolean} True when at least one successful child was not a no-op.
 */
export function macroResultsChanged(results = []) {
	return results.some((result) => {
		if (!result || result.noOp === true) {
			return false;
		}

		if (Array.isArray(result.results)) {
			return macroResultsChanged(result.results);
		}

		return result.ok === true;
	});
}

/**
 * Returns compact macro-level evidence after the atomic transaction closes or proves empty.
 * @param {string} macroId Executed macro identity.
 * @param {string} transactionId Shared transaction provenance identity.
 * @param {Array<object>} results Child command and macro results.
 * @param {boolean} changed Whether canonical project state changed.
 * @returns {object} Serializable macro outcome.
 */
export function createMacroOutcome(
	macroId,
	transactionId,
	results,
	changed
) {
	return {
		ok: true,
		noOp: !changed,
		macroId,
		transactionId,
		results
	};
}
