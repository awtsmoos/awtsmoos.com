// B"H

const crypto = require("node:crypto");

const SECRET_PATTERN = /authorization|cookie|credential|private.?key|pairing.?code|pairing.?secret|password|secret|token/i;
const IDENTIFIER_PATTERN = /deviceId|tunnelId|tunnelName|publicKeyFingerprint|credentialHash/i;

/**
 * @file Redacts diagnostic values before they leave private runtime state.
 * @description
 * The Awtsmoos reveals the shape of failure without revealing the keys of the
 * vessel. Secret fields become fixed labels; useful identifiers become short hashes
 * so one incident can still be correlated across processes and phases.
 */
function value(input, key = "") {
	if (SECRET_PATTERN.test(String(key))) return "[REDACTED]";
	if (Array.isArray(input)) return input.map(item => value(item, key));
	if (input && typeof input === "object") {
		return Object.fromEntries(
			Object.entries(input).map(([name, item]) => [name, value(item, name)])
		);
	}
	if (IDENTIFIER_PATTERN.test(String(key)) && input) return fingerprint(input);
	return input;
}

function text(input) {
	return String(input || "")
		.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
		.replace(/AwtsmoosKey\s+[A-Za-z0-9._~+/=-]+/gi, "AwtsmoosKey [REDACTED]")
		.replace(/(pairingCode|credential|privateKey|token|secret|password)\s*[=:]\s*\S+/gi,
			"$1=[REDACTED]");
}

function fingerprint(input) {
	return `sha256:${crypto.createHash("sha256").update(String(input)).digest("hex").slice(0, 16)}`;
}

module.exports = {
	fingerprint,
	text,
	value
};
