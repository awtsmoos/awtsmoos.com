//B"H
//Blessed is He
//Boruch Hashem


/**
 * Canonical service-auth bytes and base64url helpers.
 * Split sibling of serviceAuth.js (verbatim relocation).
 */

var { SIGN_VERSION } = require("./serviceAuthCore.js");

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
 * Canonical bytes the signature covers. Both sides MUST build the same
 * logical object: { v, ts, op, claims }.
 */
function canonicalServiceBytes({ ts, op, claims }) {
	const obj = sortKeys({
		v: SIGN_VERSION,
		ts: Number(ts),
		op: String(op || ''),
		claims: claims && typeof claims === 'object' ? claims : {},
	});
	return Buffer.from(JSON.stringify(obj), 'utf8');
}

/** base64url decode helper (claims travel base64url to stay header-safe). */
function b64urlDecode(s) {
	const b64 = String(s).replace(/-/g, '+').replace(/_/g, '/');
	return Buffer.from(b64, 'base64');
}

/** base64url encode helper. */
function b64urlEncode(buf) {
	return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

module.exports = {
	sortKeys,
	canonicalServiceBytes,
	b64urlDecode,
	b64urlEncode
};
