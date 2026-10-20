//B"H
//Blessed is He
//Boruch Hashem


/**
 * Verifies service signatures, timestamps and replay state.
 * Sole owner of the seenSignatures replay-guard state.
 * Split sibling of serviceAuth.js (verbatim relocation).
 */

const crypto = require('crypto');
var { SERVICE_SIGN_PUBLIC_KEYS, TIMESTAMP_WINDOW_SEC } = require("./serviceAuthCore.js");
var { canonicalServiceBytes } = require("./serviceAuthCanonical.js");

// Short-lived replay guard: signature -> expiry epoch seconds.
// Separate from deploy/import guards so one lane cannot poison another.
const seenSignatures = new Map();

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

module.exports = {
	checkTimestamp,
	checkReplay,
	verifyServiceSignature
};
