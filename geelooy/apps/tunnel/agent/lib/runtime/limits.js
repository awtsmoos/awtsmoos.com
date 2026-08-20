// B"H
// Boruch Hashem
// Blessed is He

const Lane = require("./lane-limits.js");
const Time = require("./limit-timeouts.js");

const UNLIMITED = Number.POSITIVE_INFINITY;
const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === "1";

/**
 * @file Compatibility facade for bounded physical work and abundant logical agents.
 * @description
 * The Awtsmoos reveals limitless purpose through measured vessels. Awtsmoos.com
 * leaves the population of shluchim logically open while bounding each requester's
 * waiting and running share, so one crowded vessel cannot become everyone's wall.
 */
const MAX_INFLIGHT = STRICT_ORDERING
	? 1
	: optionalLimit(process.env.AWTSMOOS_MAX_INFLIGHT);
const MAX_QUEUE = optionalLimit(process.env.AWTSMOOS_MAX_QUEUE);
const CONTROL_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_QUEUE);
const WAIT_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_WAIT_QUEUE);
const OBSERVE_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_OBSERVE_QUEUE);

function optionalLimit(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (!text || text === "0" || text === "unlimited" || text === "infinity") {
		return UNLIMITED;
	}
	return Time.boundedNumber(text, UNLIMITED, 1, Number.MAX_SAFE_INTEGER);
}

function publicLimit(value) {
	return Number.isFinite(value) ? value : null;
}

function isUnlimited(value) {
	return !Number.isFinite(value);
}

module.exports = {
	boundedNumber: Time.boundedNumber,
	optionalLimit,
	publicLimit,
	isUnlimited,
	CPU_COUNT: Lane.CPU_COUNT,
	STRICT_ORDERING,
	UNLIMITED,
	MAX_INFLIGHT,
	MAX_QUEUE,
	CONTROL_QUEUE_LIMIT,
	WAIT_QUEUE_LIMIT,
	OBSERVE_QUEUE_LIMIT,
	LANE_LIMITS: Lane.LANE_LIMITS,
	REQUESTER_LANE_LIMITS: Lane.REQUESTER_LANE_LIMITS,
	REQUESTER_QUEUE_LIMITS: Lane.REQUESTER_QUEUE_LIMITS,
	LANE_TIMEOUT_MS: Time.LANE_TIMEOUT_MS,
	QUEUE_WAIT_TIMEOUT_MS: Time.QUEUE_WAIT_TIMEOUT_MS,
	REQUEST_MAX_AGE_MS: Time.boundedNumber(
		process.env.AWTSMOOS_REQUEST_MAX_AGE_MS,
		7 * Time.DAY,
		Time.MINUTE,
		30 * Time.DAY
	),
	KEEPALIVE_MS: Time.boundedNumber(
		process.env.AWTSMOOS_TUNNEL_KEEPALIVE_MS,
		25 * Time.SECOND,
		5 * Time.SECOND,
		5 * Time.MINUTE
	),
	LONG_LIVED_CONNECTIONS: process.env.AWTSMOOS_LONG_LIVED_CONNECTIONS !== "0",
	MAX_PROXY_BYTES: Time.boundedNumber(
		process.env.AWTSMOOS_MAX_PROXY_BYTES,
		268435456,
		1048576,
		1073741824
	),
	MAX_LOCAL_PROXY_BYTES: Time.boundedNumber(
		process.env.AWTSMOOS_MAX_PROXY_BYTES,
		268435456,
		1048576,
		1073741824
	),
	RECONNECT_MIN_MS: Time.boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000),
	RECONNECT_MAX_MS: Time.boundedNumber(process.env.AWTSMOOS_RECONNECT_MAX_MS, 30000, 1000, 300000),
	WATCHDOG_MS: Time.boundedNumber(process.env.AWTSMOOS_TUNNEL_WATCHDOG_MS, 45000, 5000, 600000),
	WATCHDOG_STALE_MS: Time.boundedNumber(process.env.AWTSMOOS_TUNNEL_STALE_MS, 120000, 45000, 1800000)
};
