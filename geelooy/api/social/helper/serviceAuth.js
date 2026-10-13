// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ServiceAuth
 * @description
 * Unified Ed25519 service authentication for the VM/tunnel.
 *
 * WHY: Yaakov's law — "you should be able to use the tunnel authentication to
 * auto log in to any part of Awtsmoos instantly." The VM holds Ed25519 private
 * keys whose public halves are baked into the source (same pattern as
 * packed/deploySign.js and packed/importSign.js). Any API route can call
 * authenticateServiceRequest() to accept the tunnel as an authenticated
 * service actor — no user session, no per-alias Bearer credential needed.
 *
 * Wire format (HTTP headers — works for JSON bodies AND binary PUTs):
 *   x-awtsmoos-service-ts:     <unix seconds>
 *   x-awtsmoos-service-op:     <operation family, e.g. "drive">
 *   x-awtsmoos-service-claims: <base64url JSON, e.g. {"aliasId":"..."}>
 *   x-awtsmoos-service-sig:    <base64 Ed25519 over canonical bytes>
 * The signature covers the CANONICAL form of { v:1, ts, op, claims }
 * (auth fields excluded). Server rejects when |now - ts| > 300s and keeps a
 * short in-memory set of seen signatures to reject exact replays.
 *
 * Security properties:
 * - op binds the signature to one API family (a drive signature cannot be
 *   replayed against another API).
 * - claims bind route specifics; callers SHOULD pass expectedClaims
 *   (e.g. { aliasId }) so a signature for alias A cannot drive alias B.
 * - The private keys never leave the VM (~/.awtsmoos/secure/, chmod 600).
 * - Public keys are baked here, auditable in git, survive restarts.
 *
 * REUSABLE PATTERN for other routes:
 *   const { authenticateServiceRequest, hasServiceAuthHeaders } = require('../serviceAuth.js');
 *   // in your auth gate, BEFORE user-session checks:
 *   if (hasServiceAuthHeaders(req.headers)) {
 *     const r = authenticateServiceRequest(req.headers, {
 *       expectedOp: 'mydomain',            // required: op must match
 *       expectedClaims: { tenant: 'x' },   // optional: claims must include these
 *       grantScopes: ['mydomain.write'],   // scopes the service actor receives
 *       actorLabel: 'vm-service-key',      // optional credential label
 *     });
 *     if (!r.ok) throw authError(r.error, r.statusCode);
 *     // r.actor = { actorType:'service', actorUserId:null, aliasId, credentialId, scopes }
 *   }
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Authorized VM service public keys (SPKI PEM). Array form allows rotation:
// verification tries each key in order. These are the same keys trusted for
// packed deploys and bulk imports — the operator's own machine. Private
// halves live ONLY on the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const SERVICE_SIGN_PUBLIC_KEYS = [
	// deploy-signing-key.pub
	`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOlCMD31JidPI9EJrnMJG49el4Ajd8EQHsuMD0OW9knM=
-----END PUBLIC KEY-----`,
	// import-signing-key.pub
	`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAchC9MGIH7eLYvUPee0eNtL0ff7pL6SVcvKAPDw0UBlk=
-----END PUBLIC KEY-----`,
];

const SIGN_VERSION = 1;
const TIMESTAMP_WINDOW_SEC = 300; // 5 minutes

const HDR_TS = 'x-awtsmoos-service-ts';
const HDR_OP = 'x-awtsmoos-service-op';
const HDR_CLAIMS = 'x-awtsmoos-service-claims';
const HDR_SIG = 'x-awtsmoos-service-sig';

// Short-lived replay guard: signature -> expiry epoch seconds.
// Separate from deploy/import guards so one lane cannot poison another.
const seenSignatures = new Map();

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

/** Check the timestamp is a number inside the acceptance window. */
function checkTimestamp(ts) {
	const t = Number(ts);
	if (!Number.isFinite(t)) return { ok: false, error: 'SERVICE_BAD_TIMESTAMP', statusCode: 401 };
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - t) > TIMESTAMP_WINDOW_SEC) return { ok: false, error: 'SERVICE_STALE_TIMESTAMP', statusCode: 401 };
	return { ok: true };
}

/** Reject exact replays inside the window; prune expired entries. */
function checkReplay(sigB64, ts) {
	const now = Math.floor(Date.now() / 1000);
	for (const [s, exp] of seenSignatures) {
		if (exp < now) seenSignatures.delete(s);
	}
	if (seenSignatures.has(sigB64)) return { ok: false, error: 'SERVICE_REPLAYED_SIGNATURE', statusCode: 401 };
	seenSignatures.set(sigB64, Number(ts) + TIMESTAMP_WINDOW_SEC);
	return { ok: true };
}

/** Verify a base64 signature against the authorized service public keys. */
function verifyServiceSignature({ ts, op, claims }, sigB64) {
	if (typeof sigB64 !== 'string' || !sigB64) {
		return { ok: false, error: 'SERVICE_MISSING_SIGNATURE', statusCode: 401 };
	}
	let sig;
	try {
		sig = Buffer.from(sigB64, 'base64');
	} catch {
		return { ok: false, error: 'SERVICE_BAD_SIGNATURE_ENCODING', statusCode: 401 };
	}
	if (sig.length !== 64) return { ok: false, error: 'SERVICE_BAD_SIGNATURE', statusCode: 401 };
	const data = canonicalServiceBytes({ ts, op, claims });
	for (const pem of SERVICE_SIGN_PUBLIC_KEYS) {
		try {
			const pub = crypto.createPublicKey(pem);
			if (crypto.verify(null, data, pub, sig)) return { ok: true };
		} catch {}
	}
	return { ok: false, error: 'SERVICE_BAD_SIGNATURE', statusCode: 401 };
}

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
	SERVICE_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	HDR_TS,
	HDR_OP,
	HDR_CLAIMS,
	HDR_SIG,
	sortKeys,
	canonicalServiceBytes,
	signServicePayload,
	serviceAuthHeaders,
	hasServiceAuthHeaders,
	checkTimestamp,
	checkReplay,
	verifyServiceSignature,
	authenticateServiceRequest,
};
