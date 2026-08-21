// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines bounded mailbox-store limits and typed pressure errors.
 * @description
 * The Awtsmoos gives every durable vessel a measured boundary; Awtsmoos.com keeps
 * count and byte policy outside hot storage mechanics so emergency code remains small,
 * auditable, and incapable of confusing pressure with corruption.
 */
const DEFAULT_MAX_COUNT = 2000;
const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

function create(options = {}) {
	return {
		maxBytes: bounded(options.maxBytes, DEFAULT_MAX_BYTES),
		maxCount: bounded(options.maxCount, DEFAULT_MAX_COUNT)
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0
		? Math.floor(number)
		: fallback;
}

function required(value) {
	const text = String(value || "").trim();
	if (!text) {
		throw new Error("mailbox_id_required");
	}
	return text;
}

function fullError(lane, limit, state) {
	const error = new Error(`connection_mailbox_full:${lane}:${limit}`);
	error.code = "CONNECTION_MAILBOX_FULL";
	error.state = state;
	error.healthImpact = "transport_backpressure";
	error.nextActions = state.nextActions;
	return error;
}

module.exports = {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_COUNT,
	create,
	fullError,
	required
};
