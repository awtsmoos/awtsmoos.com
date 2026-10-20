//B"H
//Blessed is He
//Boruch Hashem

/**
 * Canonical byte form covered by deploy signatures (split from deploySign.js).
 */

const { SIGN_VERSION } = require('./deploySignKeys.js');

/** Recursively sort object keys for deterministic JSON. */
function sortKeys(value) {
	if (Array.isArray(value)) return value.map(sortKeys);
	if (value && typeof value === 'object' && !(value instanceof Buffer)) {
		const out = {};
		for (const k of Object.keys(value).sort()) out[k] = sortKeys(value[k]);
		return out;
	}
	return value;
}

/**
 * Canonical bytes the signature covers. Both sides MUST call this on the
 * same logical object: { v, ts, message, files } — never the raw request body.
 */
function canonicalBytes({ ts, message, files }) {
	const obj = sortKeys({ v: SIGN_VERSION, ts: Number(ts), message: String(message || ''), files: files || [] });
	return Buffer.from(JSON.stringify(obj), 'utf8');
}

module.exports = {
	sortKeys,
	canonicalBytes,
};
