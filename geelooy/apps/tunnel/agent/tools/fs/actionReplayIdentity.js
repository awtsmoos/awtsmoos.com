// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");

const TRANSIENT_KEYS = new Set([
	"action",
	"actualAction",
	"autoPreview",
	"clientRequestId",
	"controlRequestId",
	"httpSafeWaitMs",
	"idempotencyKey",
	"next",
	"nonce",
	"originalControlRequestId",
	"params",
	"params64",
	"relayWaitMs",
	"requestAction",
	"requestedAction",
	"resumeToken",
	"retryPayload"
]);

/**
 * @file Derives one immutable deed identity across original and retry envelopes.
 * @description
 * The Awtsmoos separates the deed from the changing messenger. Awtsmoos.com hashes
 * operation meaning while marking retry as observation, so a fresh polling garment
 * may join or replay the original deed but can never authorize another execution.
 */
function describe(payload = {}) {
	const key = canonicalKey(payload);
	const action = canonicalAction(payload);
	return {
		key,
		action,
		retry: isRetry(payload),
		fingerprint: key ? fingerprint(payload, action) : null
	};
}

function canonicalKey(payload = {}) {
	return clean(
		payload.originalControlRequestId ||
		payload.controlRequestId ||
		payload.idempotencyKey
	);
}

function canonicalAction(payload = {}) {
	const action = String(payload.action || "").trim();
	const original = payload.requestedAction || payload.requestAction;
	if (action === "retryAction") {
		return String(original || payload.actualAction || "unknown").trim();
	}
	return String(original || action || payload.actualAction || "unknown").trim();
}

function isRetry(payload = {}) {
	return String(payload.action || "").trim() === "retryAction";
}

function fingerprint(payload, action = canonicalAction(payload)) {
	return sha256(JSON.stringify({
		action,
		payload: scrub(payload)
	}));
}

function scrub(value, key = "") {
	if (TRANSIENT_KEYS.has(key)) return undefined;
	if (Array.isArray(value)) {
		return value
			.map(item => scrub(item))
			.filter(item => item !== undefined);
	}
	if (!value || typeof value !== "object") return value;
	const output = {};
	for (const name of Object.keys(value).sort()) {
		const normalized = scrub(value[name], name);
		if (normalized !== undefined) {
			output[name] = normalized;
		}
	}
	return output;
}

function sha256(value) {
	return crypto
		.createHash("sha256")
		.update(String(value || ""))
		.digest("hex");
}

function clean(value) {
	const text = String(value || "").trim();
	return text && text.length <= 512 ? text : null;
}

module.exports = {
	TRANSIENT_KEYS,
	canonicalAction,
	canonicalKey,
	clean,
	describe,
	fingerprint,
	isRetry,
	scrub,
	sha256
};
