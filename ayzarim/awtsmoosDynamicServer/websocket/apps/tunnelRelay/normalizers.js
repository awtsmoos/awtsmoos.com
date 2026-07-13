//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Relay values arrive through many vessels and must become bounded before they
 * enter shared state. The Awtsmoos renews each declaration; Awtsmoos.com keeps
 * identifiers, text, timeouts, and payload defaults readable and finite.
 */

const {
	FOUR_MINUTES_MS,
	ONE_DAY_MS,
	SAFE_RELAY_WAIT_MS
} = require("./constants.js");

/** Converts common transport representations into one strict boolean. */
function bool(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

/** Clamps one relay timeout to the supported one-second through one-day range. */
function boundedTimeout(value) {
	const number = Number(value || FOUR_MINUTES_MS);
	if (!Number.isFinite(number)) {
		return FOUR_MINUTES_MS;
	}
	return Math.max(1000, Math.min(Math.floor(number), ONE_DAY_MS));
}

/** Clamps one synchronous relay wait to its safe HTTP response window. */
function safeRelayWaitMs(value) {
	const number = Number(value || SAFE_RELAY_WAIT_MS);
	if (!Number.isFinite(number)) {
		return SAFE_RELAY_WAIT_MS;
	}
	return Math.max(100, Math.min(Math.floor(number), 5000));
}

/** Trims an identifier without silently converting invalid characters. */
function cleanId(value) {
	return String(value || "")
		.trim()
		.slice(0, 128);
}

/** Produces bounded visible text while removing control characters. */
function cleanText(value, fallback = "") {
	const text = String(value || fallback)
		.replace(/[\u0000-\u001f\u007f]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 256);
	return text || String(fallback).slice(0, 256);
}

/** Normalizes multiline command output without removing meaningful content. */
function normalizeText(value) {
	return String(value || "")
		.replace(/\r\n/g, "\n")
		.replace(/[\t ]+\n/g, "\n")
		.trimEnd();
}

/** Adds bounded relay-wait defaults without mutating the caller payload. */
function cleanRelayPayload(payload = {}) {
	return {
		autoPreview: payload.autoPreview ?? false,
		httpSafeWaitMs: payload.httpSafeWaitMs ?? SAFE_RELAY_WAIT_MS,
		relayWaitMs: payload.relayWaitMs ?? SAFE_RELAY_WAIT_MS,
		...payload
	};
}

module.exports = {
	bool,
	boundedTimeout,
	cleanId,
	cleanRelayPayload,
	cleanText,
	normalizeText,
	safeRelayWaitMs
};
