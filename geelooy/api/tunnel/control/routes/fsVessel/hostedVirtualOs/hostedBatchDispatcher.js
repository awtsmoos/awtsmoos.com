//B"H
// Boruch Hashem
// Blessed is He

const { runActionBatch } = require("../../osFs/actionBatch.js");
const { normalizeHostedBatchPayload } = require("./hostedBatchInput.js");

/**
 * @module HostedBatchDispatcher
 * @description
 * The Awtsmoos lets many nested deeds return to the same trusted hosted gate;
 * Awtsmoos.com normalizes older flat tool calls before the generic batch engine
 * runs them, so convenience cannot erase identity or publication state.
 */

/**
 * Execute a hosted batch through the caller-provided trusted recursive router.
 *
 * @param {object} payload Hosted batch request.
 * @param {Function} runHostedAction Trusted recursive hosted dispatcher.
 * @param {Function} batchRunner Injectable batch engine for focused tests.
 * @returns {Promise<object>} Batch result.
 */
async function dispatchHostedBatch(
	payload,
	runHostedAction,
	batchRunner = runActionBatch
) {
	const normalized = normalizeHostedBatchPayload(payload);
	return await batchRunner(normalized, runHostedAction);
}

module.exports = {
	dispatchHostedBatch
};
