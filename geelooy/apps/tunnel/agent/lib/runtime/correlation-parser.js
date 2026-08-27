// B"H
const Definitions = require('./correlation-definitions.js');

/** B"H — Nested JSON carriers are decoded within a bounded depth and size. */
function decodeCarrier(value, key = '') {
	return jsonish(value, key);
}

function jsonish(value, key = '') {
	if (!value) return null;
	if (plainObject(value)) return value;
	if (typeof value !== 'string' || value.length > Definitions.MAX_PARSE_CHARS) return null;
	let text = value.trim();
	if (!text) return null;
	if (Definitions.BASE64_KEYS.has(key)) {
		try { text = Buffer.from(text, 'base64').toString('utf8').trim(); }
		catch { return null; }
	}
	if (!text || !/^[{\[]/.test(text)) return null;
	try {
		const parsed = JSON.parse(text);
		return plainObject(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

function carrierObjects(input = {}) {
	const objects = [];
	for (const key of Definitions.CARRIER_KEYS) {
		if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
		const parsed = jsonish(input[key], key);
		if (parsed) objects.push(parsed);
	}
	return objects;
}

function plainObject(value) {
	return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

module.exports = { carrierObjects, decodeCarrier, jsonish, plainObject };
