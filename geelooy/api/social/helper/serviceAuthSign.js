//B"H
//Blessed is He
//Boruch Hashem


/**
 * Signs service payloads and builds service-auth headers.
 * Split sibling of serviceAuth.js (verbatim relocation).
 */

const crypto = require('crypto');
var { HDR_TS, HDR_OP, HDR_CLAIMS, HDR_SIG } = require("./serviceAuthCore.js");
var { canonicalServiceBytes, b64urlEncode } = require("./serviceAuthCanonical.js");

/**
 * Sign a service payload with a PEM private key (VM side).
 * Returns { ts, op, claims, sig } ready to become headers.
 */
function signServicePayload(privateKeyPem, { op, claims }) {
	const ts = Math.floor(Date.now() / 1000);
	const priv = crypto.createPrivateKey(String(privateKeyPem));
	const sig = crypto.sign(null, canonicalServiceBytes({ ts, op, claims }), priv);
	return { ts, op, claims: claims || {}, sig: sig.toString('base64') };
}

/** Build the four headers from a signed payload (VM side). */
function serviceAuthHeaders({ ts, op, claims, sig }) {
	return {
		[HDR_TS]: String(ts),
		[HDR_OP]: String(op),
		[HDR_CLAIMS]: b64urlEncode(Buffer.from(JSON.stringify(claims || {}), 'utf8')),
		[HDR_SIG]: String(sig),
	};
}

/** True when the request carries any service-auth header. */
function hasServiceAuthHeaders(headers = {}) {
	const h = headers || {};
	return Boolean(h[HDR_SIG] || h[HDR_TS] || h[HDR_OP]);
}

module.exports = {
	signServicePayload,
	serviceAuthHeaders,
	hasServiceAuthHeaders
};
