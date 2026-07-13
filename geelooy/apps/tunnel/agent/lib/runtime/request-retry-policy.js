// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Policy distinguishes an unlimited living road from expired history. The
 * Awtsmoos gives every active request room, while Awtsmoos.com may opt into a
 * finite emergency ceiling through environment configuration.
 */
const MAX_RECORDS = optionalLimit(
	process.env.AWTSMOOS_RETRY_REGISTRY_MAX
);

const COMPLETED_TTL_MS = positive(
	process.env.AWTSMOOS_RETRY_COMPLETED_TTL_MS,
	5 * 60 * 1000
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

module.exports = {
	COMPLETED_TTL_MS,
	MAX_RECORDS,
	isLimited,
	optionalLimit,
	positive,
	publicLimit
};
