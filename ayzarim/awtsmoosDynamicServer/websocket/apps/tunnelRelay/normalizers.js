// B"H

const { FOUR_MINUTES_MS, ONE_DAY_MS, SAFE_RELAY_WAIT_MS } = require("./constants.js");

function bool(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

function boundedTimeout(value) {
	const number = Number(value || FOUR_MINUTES_MS);
	if (!Number.isFinite(number)) return FOUR_MINUTES_MS;
	return Math.max(1000, Math.min(Math.floor(number), ONE_DAY_MS));
}

function safeRelayWaitMs(value) {
	const number = Number(value || SAFE_RELAY_WAIT_MS);
	if (!Number.isFinite(number)) return SAFE_RELAY_WAIT_MS;
	return Math.max(100, Math.min(Math.floor(number), 5000));
}

function normalizeText(value) {
	return String(value || "")
		.replace(/\r\n/g, "\n")
		.replace(/[\t ]+\n/g, "\n")
		.trimEnd();
}

function cleanRelayPayload(payload = {}) {
	const cleaned = { ...payload };
	if (cleaned.autoPreview === undefined) cleaned.autoPreview = false;
	if (cleaned.relayWaitMs === undefined) cleaned.relayWaitMs = SAFE_RELAY_WAIT_MS;
	if (cleaned.httpSafeWaitMs === undefined) cleaned.httpSafeWaitMs = SAFE_RELAY_WAIT_MS;
	return cleaned;
}

module.exports = { bool, boundedTimeout, safeRelayWaitMs, normalizeText, cleanRelayPayload };
