// B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/**
 * B"H
 * Counts remain faithful to explicit callers instead of hiding arbitrary fleet
 * caps. Time and offsets remain nonnegative so Awtsmoos.com can schedule them.
 */
function fields(raw = {}) {
	return {
		depth: Parse.numberValue(raw.depth, 2, 0),
		limit: Parse.numberValue(raw.limit, 150, 1),
		maxChars: Parse.numberValue(raw.maxChars, 12000, 1),
		totalMaxChars: Parse.numberValue(raw.totalMaxChars, 24000, 1),
		maxFiles: Parse.numberValue(raw.maxFiles, 5, 1),
		maxResults: optional(raw.maxResults, 1),
		pageSize: optional(raw.pageSize, 1),
		offsetChars: Parse.numberValue(raw.offsetChars, 0, 0),
		maxBytes: Parse.numberValue(raw.maxBytes, 24000, 1),
		offsetBytes: Parse.numberValue(raw.offsetBytes, 0, 0),
		maxInlineBytes: optional(raw.maxInlineBytes, 1),
		startLine: Parse.numberValue(raw.startLine, 1, 1),
		endLine: Parse.numberValue(raw.endLine, 250, 1),
		timeoutMs: Parse.numberValue(
			raw.timeoutMs,
			240000,
			100,
			86400000
		),
		waitTimeoutMs: Parse.numberValue(
			raw.waitTimeoutMs || raw.timeoutMs,
			25000,
			100,
			86400000
		),
		pollIntervalMs: Parse.numberValue(
			raw.pollIntervalMs,
			1000,
			10,
			60000
		),
		maxWaitMs: raw.maxWaitMs
			? Parse.numberValue(
				raw.maxWaitMs,
				86400000,
				100,
				86400000
			)
			: undefined
	};
}

function optional(value, minimum = 0) {
	if (
		value === undefined ||
		value === null ||
		value === ""
	) {
		return undefined;
	}

	return Parse.numberValue(
		value,
		minimum,
		minimum
	);
}

module.exports = {
	fields,
	optional
};
