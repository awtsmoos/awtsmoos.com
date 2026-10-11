// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedImportSign
 * @description
 * Ed25519 signature auth for the packed post-import API (bulk import lane).
 *
 * WHY: the operator-key path (AWTSMOOS_IMPORT_KEY env var) is transient — a
 * production restart wipes it, exactly like the old deploy shared secret.
 * A public key baked into this file survives every restart, is auditable in
 * git, and the private key never leaves the VM's persistent disk
 * (~/.awtsmoos/secure/import-signing-key, chmod 600).
 *
 * This is a SEPARATE keypair from the deploy signer, so the import lane can
 * be rotated alone without touching deploys.
 *
 * Wire format (JSON body on POST /packed/import/posts/start):
 *   { ts, sig, op, heichelId, payloadHash, ...normal fields }
 * The signature covers the CANONICAL form of { v:1, ts, op, heichelId, payloadHash }
 * (auth fields excluded). payloadHash binds the actual payload:
 *   - inline mode: sha256 hex of JSON.stringify(body.posts) as received
 *   - staged mode: sha256 hex of the uploadId string
 * Server recomputes payloadHash from the received payload and rejects on
 * mismatch, then verifies the signature. Timestamp window + in-memory replay
 * guard mirror the deploy signer.
 */

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Authorized import-signing public keys (SPKI PEM). Array form allows future
// rotation: verification tries each key in order. Private halves live ONLY on
// the VM and are never committed, transmitted, or logged.
// ---------------------------------------------------------------------------
const IMPORT_SIGN_PUBLIC_KEYS = [
`-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAchC9MGIH7eLYvUPee0eNtL0ff7pL6SVcvKAPDw0UBlk=
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

/** Sign a payload with a PEM private key. Returns base64 signature. */
function signPayload(privateKeyPem, { ts, op, heichelId, payloadHash }) {
	const priv = crypto.createPrivateKey(String(privateKeyPem));
	const sig = crypto.sign(null, canonicalBytes({ ts, op, heichelId, payloadHash }), priv);
	return sig.toString('base64');
}

/**
 * Verify a base64 signature against the authorized public keys.
 * Returns { ok:true } or { ok:false, error }.
 */
function verifySignature({ ts, op, heichelId, payloadHash }, sigB64) {
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
	const data = canonicalBytes({ ts, op, heichelId, payloadHash });
	for (const pem of IMPORT_SIGN_PUBLIC_KEYS) {
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

/** sha256 hex of a string. */
function sha256hex(s) {
	return crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');
}

module.exports = {
	IMPORT_SIGN_PUBLIC_KEYS,
	SIGN_VERSION,
	TIMESTAMP_WINDOW_SEC,
	canonicalBytes,
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
	sha256hex,
};
