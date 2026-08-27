// B"H
// Boruch Hashem
// Blessed is He

const Origin = require("./self-update-origin.js");

const DEFAULT_INTERVAL_MS = 300000;
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RESPONSE_BYTES = 4 * 1024 * 1024;
const DEFAULT_REDIRECT_LIMIT = 4;
const SAFE_MODES = new Set(["notify", "off"]);

/**
 * @file Bounds update discovery without granting it runtime mutation authority.
 * @description
 * The Awtsmoos renews frequency, transport size, redirects, and origin separately.
 * Awtsmoos.com lets background discovery observe a small signed release surface,
 * while the transactional installer alone may replace the living runtime.
 */
function mode(options = {}) {
	const selected = String(
		options.mode || process.env.AWTSMOOS_SELF_UPDATE_MODE || "notify"
	).toLowerCase();
	return SAFE_MODES.has(selected) ? selected : "notify";
}

function disabled(options = {}) {
	const explicit = String(
		options.disabled ?? process.env.AWTSMOOS_SELF_UPDATE_DISABLED ?? ""
	).toLowerCase();
	return mode(options) === "off" || ["1", "true", "yes", "on"].includes(explicit);
}

function intervalMs(options = {}) {
	return bounded(
		options.intervalMs || process.env.AWTSMOOS_SELF_UPDATE_INTERVAL_MS,
		DEFAULT_INTERVAL_MS,
		5000,
		3600000
	);
}

function timeoutMs(options = {}) {
	return bounded(
		options.timeoutMs || process.env.AWTSMOOS_SELF_UPDATE_TIMEOUT_MS,
		DEFAULT_TIMEOUT_MS,
		1000,
		120000
	);
}

function maxResponseBytes(options = {}) {
	return bounded(
		options.maxBytes || process.env.AWTSMOOS_SELF_UPDATE_MAX_BYTES,
		DEFAULT_MAX_RESPONSE_BYTES,
		1024,
		64 * 1024 * 1024
	);
}

function redirectLimit(options = {}) {
	return bounded(
		options.redirectLimit || process.env.AWTSMOOS_SELF_UPDATE_REDIRECT_LIMIT,
		DEFAULT_REDIRECT_LIMIT,
		0,
		10
	);
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_MAX_RESPONSE_BYTES,
	DEFAULT_REDIRECT_LIMIT,
	DEFAULT_TIMEOUT_MS,
	OFFICIAL_ORIGIN: Origin.OFFICIAL_ORIGIN,
	bounded,
	cleanOrigin: Origin.clean,
	disabled,
	intervalMs,
	isAwtsmoosHost: Origin.isAwtsmoosHost,
	maxResponseBytes,
	mode,
	originFromConfig: Origin.fromConfig,
	redirectLimit,
	timeoutMs
};
