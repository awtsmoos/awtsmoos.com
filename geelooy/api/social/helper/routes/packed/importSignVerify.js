//B"H
//Blessed is He
//Boruch Hashem

/**
 * Import signature signing, verification, timestamp, replay guards and sha256 helper (split from importSign.js).
 */

const crypto = require('crypto');
const { IMPORT_SIGN_PUBLIC_KEYS, TIMESTAMP_WINDOW_SEC } = require('./importSignKeys.js');
const { canonicalBytes } = require('./importSignCanonical.js');

// Short-lived replay guard: signature -> expiry epoch seconds.
const seenSignatures = new Map();

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
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
	sha256hex,
};
