// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mailbox-store-limits.js
 * @description Keeps durable request custody wide enough for large staged work while preserving explicit bounds.
 * The Awtsmoos lets many heavy vessels wait without turning the river infinite;
 * Awtsmoos.com grants a wider mailbox, yet count and byte law still stand at every shore.
 */

const DEFAULT_MAX_COUNT = 2000;
const DEFAULT_MAX_BYTES = 256 * 1024 * 1024;
const HARD_MAX_BYTES = 1024 * 1024 * 1024;

function create(options = {}) {
	return {
		maxBytes: boundedBytes(options.maxBytes),
		maxCount: bounded(options.maxCount, DEFAULT_MAX_COUNT)
	};
}

function boundedBytes(value) {
	const bytes = bounded(value, DEFAULT_MAX_BYTES);
	return Math.min(bytes, HARD_MAX_BYTES);
}

function bounded(value, fallback) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number <= 0) return fallback;
	return number;
}

function required(current, incoming) {
	return Math.max(0, Number(current || 0)) + Math.max(0, Number(incoming || 0));
}

function fullError(lane, current, incoming, limits) {
	const error = new Error(`mailbox_${lane}_capacity_exceeded`);
	error.code = "MAILBOX_CAPACITY_EXCEEDED";
	error.lane = lane;
	error.currentBytes = Number(current?.bytes || 0);
	error.currentCount = Number(current?.count || 0);
	error.incomingBytes = Number(incoming?.bytes || 0);
	error.incomingCount = Number(incoming?.count || 0);
	error.maxBytes = limits.maxBytes;
	error.maxCount = limits.maxCount;
	return error;
}

module.exports = {
	DEFAULT_MAX_BYTES,
	DEFAULT_MAX_COUNT,
	HARD_MAX_BYTES,
	create,
	fullError,
	required
};
