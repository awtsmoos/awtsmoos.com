//B"H
//Blessed is He
//Boruch Hashem


/**
 * Authenticates one request carrying service-auth headers.
 * Split sibling of serviceAuth.js (verbatim relocation).
 */

var { HDR_TS, HDR_OP, HDR_CLAIMS, HDR_SIG } = require("./serviceAuthCore.js");
var { b64urlDecode } = require("./serviceAuthCanonical.js");
var { hasServiceAuthHeaders } = require("./serviceAuthSign.js");
var { checkTimestamp, checkReplay, verifyServiceSignature } = require("./serviceAuthVerify.js");

/**
 * Authenticate one request's service headers.
 *
 * Returns null when no service headers are present (caller falls through to
 * other auth). Otherwise returns { ok:true, actor } or { ok:false, error,
 * statusCode }.
 *
 * @param {object} headers Request headers (case-insensitive keys handled by caller framework; we check lowercase).
 * @param {object} options
 * @param {string} options.expectedOp Required operation family the signature's op must equal.
 * @param {object} [options.expectedClaims] Key/value pairs the signature's claims must include (exact match).
 * @param {string[]} [options.grantScopes] Scopes the authenticated service actor receives.
 * @param {string} [options.actorLabel] Credential label for audit trails.
 */
function authenticateServiceRequest(headers = {}, options = {}) {
	if (!hasServiceAuthHeaders(headers)) return null;

	const { expectedOp, expectedClaims = {}, grantScopes = [], actorLabel = 'vm-service-key' } = options;
	const h = headers || {};
	const ts = h[HDR_TS];
	const op = h[HDR_OP];
	const sigB64 = h[HDR_SIG];

	if (!expectedOp) return { ok: false, error: 'SERVICE_OP_NOT_CONFIGURED', statusCode: 500 };
	if (String(op) !== String(expectedOp)) {
		return { ok: false, error: 'SERVICE_OP_MISMATCH', statusCode: 403 };
	}

	let claims = {};
	if (h[HDR_CLAIMS]) {
		try {
			claims = JSON.parse(b64urlDecode(h[HDR_CLAIMS]).toString('utf8'));
		} catch {
			return { ok: false, error: 'SERVICE_BAD_CLAIMS', statusCode: 401 };
		}
		if (!claims || typeof claims !== 'object' || Array.isArray(claims)) {
			return { ok: false, error: 'SERVICE_BAD_CLAIMS', statusCode: 401 };
		}
	}
	for (const [k, v] of Object.entries(expectedClaims)) {
		if (claims[k] !== v) return { ok: false, error: 'SERVICE_CLAIM_MISMATCH', statusCode: 403 };
	}

	const tsCheck = checkTimestamp(ts);
	if (!tsCheck.ok) return tsCheck;
	const sigCheck = verifyServiceSignature({ ts, op, claims }, sigB64);
	if (!sigCheck.ok) return sigCheck;
	const replayCheck = checkReplay(sigB64, ts);
	if (!replayCheck.ok) return replayCheck;

	return {
		ok: true,
		actor: {
			actorType: 'service',
			actorUserId: null,
			aliasId: claims.aliasId || null,
			credentialId: actorLabel,
			scopes: [...grantScopes],
		},
	};
}

module.exports = {
	authenticateServiceRequest
};
