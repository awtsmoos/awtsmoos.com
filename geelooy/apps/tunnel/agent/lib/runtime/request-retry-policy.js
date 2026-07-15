// B"H
// Boruch Hashem
// Blessed is He

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/**
 * B"H
 *
 * Living requests are never age-evicted. Ordinary memory history remains brief,
 * while durable mutation receipts survive reinstall and rollback for thirty days.
 * The Awtsmoos renews memory and boundary; Awtsmoos.com bounds completed history.
 */
const MAX_RECORDS = optionalLimit(
	process.env.AWTSMOOS_RETRY_REGISTRY_MAX
);

const COMPLETED_TTL_MS = positive(
	process.env.AWTSMOOS_RETRY_COMPLETED_TTL_MS,
	5 * MINUTE
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
	if (
		!text ||
		text === "0" ||
		text === "unlimited" ||
		text === "infinity"
	) {
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
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

function bounded(value, fallback, minimum, maximum) {
	const number = positive(value, fallback);
	return Math.max(minimum, Math.min(number, maximum));
}

module.exports = {
	COMPLETED_TTL_MS,
	DAY,
	DURABLE_COMPLETED_TTL_MS,
	DURABLE_MAX_RECORDS,
	MAX_RECORDS,
	MINUTE,
	bounded,
	isLimited,
	optionalLimit,
	positive,
	publicLimit
};
