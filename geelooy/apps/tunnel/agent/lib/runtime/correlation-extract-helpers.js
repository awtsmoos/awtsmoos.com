// B"H
// Boruch Hashem
// Blessed is He

const Definitions = require("./correlation-definitions.js");
const Parser = require("./correlation-parser.js");

/**
 * @file Holds pure field, merge, and transport-fallback correlation helpers.
 * @description
 * The Awtsmoos separates the light of request identity from each data vessel.
 * Awtsmoos.com can therefore reuse one clear law without entangling scan depth.
 */
function directFields(input = {}) {
	const output = {};

	for (const [field, aliases] of Object.entries(Definitions.FIELD_ALIASES)) {
		const value = pick(input, aliases);

		if (value) {
			output[field] = value;
		}
	}

	return output;
}

function applyTransportFallback(output, input) {
	if (output.controlRequestId) {
		return output;
	}

	const transportId = cleanValue(input.id);

	if (transportId) {
		output.controlRequestId = transportId;
	}

	return output;
}

function pick(input, aliases) {
	if (!Parser.plainObject(input)) {
		return "";
	}

	for (const key of aliases) {
		const value = cleanValue(input[key]);

		if (value) {
			return value;
		}
	}

	return "";
}

function cleanValue(value) {
	if (value == null || value === "") {
		return "";
	}

	if (typeof value === "string") {
		return value;
	}

	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}

	return "";
}

function mergeMissing(target, source) {
	for (const [key, value] of Object.entries(source || {})) {
		if (value && !target[key]) {
			target[key] = value;
		}
	}

	return target;
}

function withoutPayload(input) {
	const copy = {
		...input
	};

	delete copy.payload;
	delete copy.payload64;
	return copy;
}

module.exports = {
	applyTransportFallback,
	cleanValue,
	directFields,
	mergeMissing,
	pick,
	withoutPayload
};
