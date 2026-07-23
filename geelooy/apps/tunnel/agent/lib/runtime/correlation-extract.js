// B"H
// Boruch Hashem
// Blessed is He

const Helpers = require("./correlation-extract-helpers.js");
const Parser = require("./correlation-parser.js");

/**
 * @file Extracts request correlation while separating transport and entity IDs.
 * @description
 * The Awtsmoos reveals inner request identity before outer transport fallback.
 * Awtsmoos.com therefore keeps a command's `id` distinct from the request path
 * that asks about it, while preserving historical top-level transport carriers.
 */
function extractCorrelationScope(input = {}) {
	if (!Parser.plainObject(input)) {
		return {};
	}

	const output = {};
	const payload = Parser.jsonish(input.payload, "payload");

	if (payload) {
		Helpers.mergeMissing(output, scanObject(payload));
		Helpers.mergeMissing(
			output,
			scanObject(Helpers.withoutPayload(input))
		);
	} else {
		Helpers.mergeMissing(output, scanObject(input));
	}

	Helpers.applyTransportFallback(output, input);
	return output;
}

function scanObject(input, seen = new Set(), depth = 0) {
	if (!Parser.plainObject(input) || depth > 4 || seen.has(input)) {
		return {};
	}

	seen.add(input);
	const output = Helpers.directFields(input);

	for (const carrier of Parser.carrierObjects(input)) {
		Helpers.mergeMissing(
			output,
			scanObject(carrier, seen, depth + 1)
		);
	}

	return output;
}

module.exports = {
	...Helpers,
	extractCorrelationScope,
	scanObject
};
