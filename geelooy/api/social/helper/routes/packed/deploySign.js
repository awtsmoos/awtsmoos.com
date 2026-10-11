// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedDeploySign
 * @description
 * Ed25519 signature auth for the packed deploy API (MAC-SEVERANCE Phase 2).
 *
 * WHY: the old shared-secret (AWTSMOOS_DEPLOY_KEY env var) was wiped by a
 * production restart — env vars are transient. A public key baked into this
 * file survives every restart, is auditable in git, and the private key never
 * leaves the VM's persistent disk (~/.awtsmoos/secure/deploy-signing-key).
 *
 * Wire format (JSON body on POST /packed/deploy/push and /packed/deploy/restart):
 *   { ts: <unix seconds>, message: <string>, files: [...], sig: <base64 Ed25519> }
 * The signature covers the CANONICAL form of { v:1, ts, message, files }
 * (auth fields excluded). Server rejects when |now - ts| > TIMESTAMP_WINDOW_SEC
 * (stale/replay guard) and keeps a short in-memory set of seen signatures to
 * reject exact replays inside the window.
 *
 * Both the production route and the VM signer (scripts/vmDeploySigned.mjs)
 * use this one module, so the canonical bytes can never drift.
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Authorized deploy-signing public keys (SPKI PEM). Array form allows future
// rotation: verification tries each key in order. Private halves live ONLY on
// the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const DEPLOY_SIGN_PUBLIC_KEYS = [
`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAOlCMD31JidPI9EJrnMJG49el4Ajd8EQHsuMD0OW9knM=
-----END PUBLIC KEY-----`,
];

const SIGN_VERSION = 1;
const TIMESTAMP_WINDOW_SEC = 300; // 5 minutes

// Short-lived replay guard: signature -> expiry epoch seconds.
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
 * Canonical bytes the signature covers. Both sides MUST call this on the
 * same logical object: { v, ts, message, files } — never the raw request body.
 */
function canonicalBytes({ ts, message, files }) {
	const obj = sortKeys({ v: SIGN_VERSION, ts: Number(ts), message: String(message || ''), files: files || [] });
	return Buffer.from(JSON.stringify(obj), 'utf8');
}

/** Sign a payload with a PEM private key. Returns base64 signature. */
function signPayload(privateKeyPem, { ts, message, files }) {
	const priv = crypto.createPrivateKey(String(privateKeyPem));
	const sig = crypto.sign(null, canonicalBytes({ ts, message, files }), priv);
	return sig.toString('base64');
}

/**
 * Verify a base64 signature against the authorized public keys.
 * Returns { ok:true } or { ok:false, error }.
 */
function verifySignature({ ts, message, files }, sigB64) {
	if (typeof sigB64 !== 'string' || !sigB64) {
		return { ok: false, error: 'MISSING_SIGNATURE' };
	}
	let sig;
	try {
		sig = Buffer.from(sigB64, 'base64');
	} catch {
		return { ok: false, error: 'BAD_SIGNATURE_ENCODING' };
	}
	if (sig.length !== 64) return { ok: false, error: 'BAD_SIGNATURE' };
	const data = canonicalBytes({ ts, message, files });
	for (const pem of DEPLOY_SIGN_PUBLIC_KEYS) {
		try {
			const pub = crypto.createPublicKey(pem);
			if (crypto.verify(null, data, pub, sig)) return { ok: true };
		} catch {}
	}
	return { ok: false, error: 'BAD_SIGNATURE' };
}

/** Check the timestamp is a number inside the acceptance window. */
function checkTimestamp(ts) {
	const t = Number(ts);
	if (!Number.isFinite(t)) return { ok: false, error: 'BAD_TIMESTAMP' };
	const now = Math.floor(Date.now() / 1000);
	if (Math.abs(now - t) > TIMESTAMP_WINDOW_SEC) return { ok: false, error: 'STALE_TIMESTAMP' };
	return { ok: true };
}

/** Reject exact replays inside the window; prune expired entries. */
function checkReplay(sigB64, ts) {
	const now = Math.floor(Date.now() / 1000);
	for (const [s, exp] of seenSignatures) {
		if (exp < now) seenSignatures.delete(s);
	}
	if (seenSignatures.has(sigB64)) return { ok: false, error: 'REPLAYED_SIGNATURE' };
	seenSignatures.set(sigB64, Number(ts) + TIMESTAMP_WINDOW_SEC);
	return { ok: true };
}

module.exports = {
	DEPLOY_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	canonicalBytes,
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
};
