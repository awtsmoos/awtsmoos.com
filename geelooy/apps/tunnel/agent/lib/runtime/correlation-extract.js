// B"H
const Definitions = require('./correlation-definitions.js');
const Parser = require('./correlation-parser.js');

/** B"H — Inner payload identity outranks its transport carrier, never vice versa. */
function extractCorrelationScope(input = {}) {
	if (!Parser.plainObject(input)) return {};
	const output = {};
	const payload = Parser.jsonish(input.payload, 'payload');
	if (payload) {
		mergeMissing(output, scanObject(payload));
		mergeMissing(output, scanObject(withoutPayload(input)));
		return output;
	}
	mergeMissing(output, scanObject(input));
	return output;
}

function scanObject(input, seen = new Set(), depth = 0) {
	if (!Parser.plainObject(input) || depth > 4 || seen.has(input)) return {};
	seen.add(input);
	const output = directFields(input);
	for (const carrier of Parser.carrierObjects(input)) {
		mergeMissing(output, scanObject(carrier, seen, depth + 1));
	}
	return output;
}

function directFields(input = {}) {
	const output = {};
	for (const [field, aliases] of Object.entries(Definitions.FIELD_ALIASES)) {
		const value = pick(input, aliases);
		if (value) output[field] = value;
	}
	return output;
}

function pick(input, aliases) {
	if (!Parser.plainObject(input)) return '';
	for (const key of aliases) {
		const value = cleanValue(input[key]);
		if (value) return value;
	}
	return '';
}

function cleanValue(value) {
	if (value == null || value === '') return '';
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	return '';
}

function mergeMissing(target, source) {
	for (const [key, value] of Object.entries(source || {})) {
		if (value && !target[key]) target[key] = value;
	}
	return target;
}

function withoutPayload(input) {
	const copy = { ...input };
	delete copy.payload;
	delete copy.payload64;
	return copy;
}

module.exports = {
	cleanValue,
	directFields,
	extractCorrelationScope,
	mergeMissing,
	pick,
	scanObject,
	withoutPayload
};
