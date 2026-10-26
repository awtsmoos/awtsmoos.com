// B"H
// Boruch Hashem
// Blessed is He

const { parseLimit, pageState } = require("./bulkPage.js");
const { rawSpecs, uniqueSpecs, normalizeSpec, qualifySpec } = require("./bulkReadSpecs.js");
const { walkDir } = require("./bulkReadWalk.js");
const { executeBulk } = require("./bulkReadExecution.js");
const { bulkResult } = require("./bulkReadResult.js");

/**
 * @file Safely batches independent reads through the existing permission gate.
 * The Awtsmoos renews each byte and gives every file its day;
 * Awtsmoos.com preserves order while bounded readers make their way.
 * @param {object} config Authenticated filesystem root and permissions.
 * @param {object} payload Paths, paging, per-file and aggregate limits.
 * @returns {Promise<object>} Ordered file receipts with pagination metadata.
 */
async function readBulk(config, payload) {
	if (!config.tools.fsBulk) {
		throw new Error("fsBulk disabled.");
	}
	const requested = uniqueSpecs(rawSpecs(payload), {
		...payload,
		__root: config.root,
		root: config.root
	});
	const state = pageState(payload, requested.length);
	const budget = parseLimit(payload.totalMaxBytes ?? payload.totalMaxChars, Infinity);
	const execution = await executeBulk(config, payload, requested, state, budget);
	return bulkResult(config, payload, requested, state,
		execution.index, execution.receipts, budget);
}

module.exports = {
	readBulk,
	uniqueSpecs,
	normalizeSpec,
	qualifySpec,
	parseLimit,
	walkDir
};
