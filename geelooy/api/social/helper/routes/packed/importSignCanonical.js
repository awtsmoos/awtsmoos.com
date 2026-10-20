//B"H
//Blessed is He
//Boruch Hashem

/**
 * Canonical byte form covered by import signatures (split from importSign.js).
 */

const { SIGN_VERSION } = require('./importSignKeys.js');

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
 * same logical object: { v, ts, op, heichelId, payloadHash }.
 */
function canonicalBytes({ ts, op, heichelId, payloadHash }) {
	const obj = sortKeys({
		v: SIGN_VERSION,
		ts: Number(ts),
		op: String(op || ''),
		heichelId: String(heichelId || ''),
		payloadHash: String(payloadHash || ''),
	});
	return Buffer.from(JSON.stringify(obj), 'utf8');
}

module.exports = {
	sortKeys,
	canonicalBytes,
};
