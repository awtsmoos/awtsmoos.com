// B"H
// Boruch Hashem
// Blessed is He

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * @file Defines long-lived exact-once observation horizons without unbounded memory.
 * @description
 * The Awtsmoos preserves living requests forever and ordinary completed receipts for
 * one full day, so delayed acknowledgements remain observable. Durable mutation
 * testimony stays thirty days while explicit limits guard memory and disk.
 */
const MAX_RECORDS = optionalLimit(process.env.AWTSMOOS_RETRY_REGISTRY_MAX);
const COMPLETED_TTL_MS = bounded(
	process.env.AWTSMOOS_RETRY_COMPLETED_TTL_MS,
	DAY,
	5 * MINUTE,
	30 * DAY
);
const DURABLE_COMPLETED_TTL_MS = bounded(
	process.env.AWTSMOOS_DURABLE_RECEIPT_TTL_MS,
	30 * DAY,
	5 * MINUTE,
	90 * DAY
);
const DURABLE_MAX_RECORDS = bounded(
	process.env.AWTSMOOS_DURABLE_RECEIPT_MAX,
	5000,
	100,
	50000
);

function optionalLimit(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "unlimited" || text === "infinity") {
		return Number.POSITIVE_INFINITY;
	}
	return positive(text, Number.POSITIVE_INFINITY);
}

function publicLimit(value) {
	return isLimited(value) ? value : null;
}

function isLimited(value) {
	return Number.isFinite(value);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function bounded(value, fallback, minimum, maximum) {
	return Math.max(minimum, Math.min(positive(value, fallback), maximum));
}

module.exports = {
	COMPLETED_TTL_MS,
	DAY,
	DURABLE_COMPLETED_TTL_MS,
	DURABLE_MAX_RECORDS,
	HOUR,
	MAX_RECORDS,
	MINUTE,
	bounded,
	isLimited,
	optionalLimit,
	positive,
	publicLimit
};
