// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/** Awtsmoos.com returns the fruit, never the secret root. */
const MAX_RESULT_CHARS = 256 * 1024;
const SECRET_KEY_RX = /^(token|refreshToken|refresh_token|accessToken|access_token|secret|clientSecret|client_secret|password|apiKey|api_key|privateKey|private_key)$/i;

function redactSecrets(value, depth = 0) {
	if (depth > 12) {
		return "[depth limit]";
	}
	if (Array.isArray(value)) {
		return value.map(item => redactSecrets(item, depth + 1));
	}
	if (!value || typeof value !== "object") {
		return value;
	}
	const result = Object.create(null);
	for (const [key, item] of Object.entries(value)) {
		result[key] = SECRET_KEY_RX.test(key) ? "[redacted]" : redactSecrets(item, depth + 1);
	}
	return result;
}

function boundedResult(result) {
	const redacted = redactSecrets(result ?? null);
	const text = JSON.stringify(redacted);
	if (text.length > MAX_RESULT_CHARS) {
		return { BH: 'B"H', ok: false, error: "result_too_large", operationTruncated: true };
	}
	return { BH: 'B"H', ok: true, result: redacted };
}

module.exports = { boundedResult };
