// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const Time = require("./limit-timeouts.js");

const UNLIMITED = Number.POSITIVE_INFINITY;
const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);
const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === "1";

const LANE_LIMITS = Object.freeze({
	p0_control: Time.boundedNumber(process.env.AWTSMOOS_P0_INFLIGHT, 8, 1, 64),
	p0_wait: Time.boundedNumber(
		process.env.AWTSMOOS_P0_WAIT_INFLIGHT,
		Math.min(128, Math.max(32, CPU_COUNT * 4)),
		1,
		256
	),
	p0_observe: Time.boundedNumber(
		process.env.AWTSMOOS_P0_OBSERVE_INFLIGHT,
		Math.min(64, Math.max(16, CPU_COUNT * 2)),
		1,
		128
	),
	p1_fs_light: Time.boundedNumber(
		process.env.AWTSMOOS_P1_INFLIGHT,
		Math.min(32, Math.max(4, CPU_COUNT * 2)),
		1,
		128
	),
	p2_chrome_light: Time.boundedNumber(process.env.AWTSMOOS_P2_INFLIGHT, 4, 1, 32),
	p3_heavy: Time.boundedNumber(
		process.env.AWTSMOOS_P3_INFLIGHT,
		Math.min(32, Math.max(4, CPU_COUNT)),
		1,
		128
	),
	p4_bulk: Time.boundedNumber(process.env.AWTSMOOS_P4_INFLIGHT, 2, 1, 32)
});

/**
 * B"H
 *
 * The Awtsmoos opens every logical doorway while physical execution remains
 * bounded. One requester receives nearly full lane speed, while one slot stays
 * reserved whenever possible so another shliach can answer without waiting.
 */
const REQUESTER_LANE_LIMITS = Object.freeze({
	p0_control: requesterLimit("AWTSMOOS_P0_PER_REQUESTER", LANE_LIMITS.p0_control),
	p0_wait: Time.boundedNumber(
		process.env.AWTSMOOS_P0_WAIT_PER_REQUESTER,
		Math.min(8, LANE_LIMITS.p0_wait),
		1,
		LANE_LIMITS.p0_wait
	),
	p0_observe: Time.boundedNumber(
		process.env.AWTSMOOS_P0_OBSERVE_PER_REQUESTER,
		Math.min(4, LANE_LIMITS.p0_observe),
		1,
		LANE_LIMITS.p0_observe
	),
	p1_fs_light: requesterLimit("AWTSMOOS_P1_PER_REQUESTER", LANE_LIMITS.p1_fs_light),
	p2_chrome_light: requesterLimit("AWTSMOOS_P2_PER_REQUESTER", LANE_LIMITS.p2_chrome_light),
	p3_heavy: requesterLimit("AWTSMOOS_P3_PER_REQUESTER", LANE_LIMITS.p3_heavy),
	p4_bulk: requesterLimit("AWTSMOOS_P4_PER_REQUESTER", LANE_LIMITS.p4_bulk)
});

const MAX_INFLIGHT = STRICT_ORDERING
	? 1
	: optionalLimit(process.env.AWTSMOOS_MAX_INFLIGHT);
const MAX_QUEUE = optionalLimit(process.env.AWTSMOOS_MAX_QUEUE);
const CONTROL_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_QUEUE);
const WAIT_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_WAIT_QUEUE);
const OBSERVE_QUEUE_LIMIT = optionalLimit(process.env.AWTSMOOS_P0_OBSERVE_QUEUE);

function requesterLimit(environmentName, laneLimit) {
	const fallback = laneLimit > 1 ? laneLimit - 1 : 1;
	return Time.boundedNumber(
		process.env[environmentName],
		fallback,
		1,
		laneLimit
	);
}

function optionalLimit(value) {
	const text = String(value ?? "").trim().toLowerCase();
	if (
		!text ||
		text === "0" ||
		text === "unlimited" ||
		text === "infinity"
	) {
		return UNLIMITED;
	}
	return Time.boundedNumber(
		text,
		UNLIMITED,
		1,
		Number.MAX_SAFE_INTEGER
	);
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
	CPU_COUNT,
	STRICT_ORDERING,
	UNLIMITED,
	MAX_INFLIGHT,
	MAX_QUEUE,
	CONTROL_QUEUE_LIMIT,
	WAIT_QUEUE_LIMIT,
	OBSERVE_QUEUE_LIMIT,
	LANE_LIMITS,
	REQUESTER_LANE_LIMITS,
	LANE_TIMEOUT_MS: Time.LANE_TIMEOUT_MS,
	REQUEST_MAX_AGE_MS: Time.boundedNumber(process.env.AWTSMOOS_REQUEST_MAX_AGE_MS, 7 * Time.DAY, Time.MINUTE, 30 * Time.DAY),
	KEEPALIVE_MS: Time.boundedNumber(process.env.AWTSMOOS_TUNNEL_KEEPALIVE_MS, 25 * Time.SECOND, 5 * Time.SECOND, 5 * Time.MINUTE),
	LONG_LIVED_CONNECTIONS: process.env.AWTSMOOS_LONG_LIVED_CONNECTIONS !== "0",
	MAX_PROXY_BYTES: Time.boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 268435456, 1048576, 1073741824),
	MAX_LOCAL_PROXY_BYTES: Time.boundedNumber(process.env.AWTSMOOS_MAX_PROXY_BYTES, 268435456, 1048576, 1073741824),
	RECONNECT_MIN_MS: Time.boundedNumber(process.env.AWTSMOOS_RECONNECT_MIN_MS, 1000, 250, 60000),
	RECONNECT_MAX_MS: Time.boundedNumber(process.env.AWTSMOOS_RECONNECT_MAX_MS, 30000, 1000, 300000),
	WATCHDOG_MS: Time.boundedNumber(process.env.AWTSMOOS_TUNNEL_WATCHDOG_MS, 45000, 5000, 600000),
	WATCHDOG_STALE_MS: Time.boundedNumber(process.env.AWTSMOOS_TUNNEL_STALE_MS, 120000, 45000, 1800000)
};
