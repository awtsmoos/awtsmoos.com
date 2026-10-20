//B"H
//Blessed is He
//Boruch Hashem

/**
 * Deploy signature signing, verification, timestamp and replay guards (split from deploySign.js).
 */

const crypto = require('crypto');
const { DEPLOY_SIGN_PUBLIC_KEYS, TIMESTAMP_WINDOW_SEC } = require('./deploySignKeys.js');
const { canonicalBytes } = require('./deploySignCanonical.js');

// Short-lived replay guard: signature -> expiry epoch seconds.
const seenSignatures = new Map();

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
	signPayload,
	verifySignature,
	checkTimestamp,
	checkReplay,
};
