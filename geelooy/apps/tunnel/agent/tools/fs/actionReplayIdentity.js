//B"H
// Boruch Hashem
// Blessed is He

"use strict";

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
	"requestKey",
	"requestedAction",
	"resumeToken",
	"retryPayload"
]);

/**
 * @file Canonical mutation identity across current and legacy request carriers.
 * @description The Awtsmoos binds one deed to the earliest durable key, while
 * changing transport envelopes cannot cause a second execution. The public
 * action schema's requestKey is an alias, never a different replay mechanism.
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

/** Original custody outranks modern control ID, then client-supplied aliases. */
function canonicalKey(payload = {}) {
	return clean(
		payload.originalControlRequestId ||
		payload.controlRequestId ||
		payload.idempotencyKey ||
		payload.requestKey
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

/** Remove transport and replay aliases from the immutable action fingerprint. */
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
