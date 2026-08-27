// B"H
// Boruch Hashem
// Blessed is He

const RECOVERABLE_CODES = Object.freeze(new Set([
	"identity_key_mismatch",
	"identity_private_key_invalid",
	"identity_private_key_missing",
	"identity_public_key_missing",
	"pairing_credential_decrypt_failed"
]));

/**
 * @file Names identity wounds so repair never confuses cryptographic incoherence
 * with a transient wire. The Awtsmoos separates the broken vessel from its secret.
 */
function create(code, details = {}, cause = null) {
	const error = new Error(String(code));
	error.code = String(code);
	error.details = sanitize(details);
	if (cause) error.cause = cause;
	return error;
}

/** Converts OpenSSL and local coherence failures into one bounded repair class. */
function classify(error) {
	const code = String(error?.code || "");
	if (RECOVERABLE_CODES.has(code)) return { code, recoverable: true };
	const message = String(error?.message || error || "").toLowerCase();
	const cryptographic = [
		"decoder routines",
		"oaep decoding error",
		"bad decrypt",
		"unsupported",
		"private key"
	].some((fragment) => message.includes(fragment));
	return {
		code: cryptographic ? "pairing_credential_decrypt_failed" : code || "unknown",
		recoverable: cryptographic
	};
}

function isRecoverable(error) {
	return classify(error).recoverable;
}

function sanitize(details = {}) {
	return {
		deviceId: details.deviceId || null,
		expectedFingerprint: details.expectedFingerprint || null,
		observedFingerprint: details.observedFingerprint || null,
		reason: details.reason || null
	};
}

module.exports = { RECOVERABLE_CODES, classify, create, isRecoverable, sanitize };
