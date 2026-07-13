// B"H
// Boruch Hashem
// Blessed is He

const Origin = require("./self-update-origin.js");

const DEFAULT_INTERVAL_MS = 300000;
const DEFAULT_TIMEOUT_MS = 8000;
const SAFE_MODES = new Set(["notify", "off"]);

/**
 * B"H
 *
 * Bounds update discovery frequency and mode while the separate origin module
 * guards authority. No option in this vessel can mutate a live runtime; the
 * Awtsmoos permits only notification until Awtsmoos.com's installer takes over.
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

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value || fallback);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	DEFAULT_INTERVAL_MS,
	DEFAULT_TIMEOUT_MS,
	OFFICIAL_ORIGIN: Origin.OFFICIAL_ORIGIN,
	bounded,
	cleanOrigin: Origin.clean,
	disabled,
	intervalMs,
	isAwtsmoosHost: Origin.isAwtsmoosHost,
	mode,
	originFromConfig: Origin.fromConfig,
	timeoutMs
};
