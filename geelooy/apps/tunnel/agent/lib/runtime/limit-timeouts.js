// B"H
// Boruch Hashem
// Blessed is He

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * @file Keeps queue-start patience separate from true execution lifetime.
 * @description
 * The Awtsmoos grants long work room to live, yet Awtsmoos.com refuses to let
 * a deed that never reached a consumer occupy a lane until an hourly clock dies.
 */
function boundedNumber(value, fallback, min, max) {
	const number = Number(value ?? fallback);
	return Number.isFinite(number)
		? Math.max(min, Math.min(max, Math.floor(number)))
		: fallback;
}

const LANE_TIMEOUT_MS = Object.freeze({
	p0_control: boundedNumber(process.env.AWTSMOOS_P0_TIMEOUT_MS, 5 * MINUTE, 5 * SECOND, DAY),
	p0_wait: boundedNumber(process.env.AWTSMOOS_P0_WAIT_TIMEOUT_MS, 2 * MINUTE, 5 * SECOND, DAY),
	p0_observe: boundedNumber(process.env.AWTSMOOS_P0_OBSERVE_TIMEOUT_MS, 2 * MINUTE, 5 * SECOND, DAY),
	p1_fs_light: boundedNumber(process.env.AWTSMOOS_P1_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
	p2_chrome_light: boundedNumber(process.env.AWTSMOOS_P2_TIMEOUT_MS, 30 * MINUTE, 5 * SECOND, DAY),
	p3_heavy: boundedNumber(process.env.AWTSMOOS_P3_TIMEOUT_MS, 4 * HOUR, 5 * SECOND, 7 * DAY),
	p4_bulk: boundedNumber(process.env.AWTSMOOS_P4_TIMEOUT_MS, 12 * HOUR, 5 * SECOND, 7 * DAY)
});

const QUEUE_WAIT_TIMEOUT_MS = Object.freeze({
	p0_control: queueWait("AWTSMOOS_P0_QUEUE_WAIT_MS", 5 * SECOND),
	p0_wait: queueWait("AWTSMOOS_P0_WAIT_QUEUE_WAIT_MS", 10 * SECOND),
	p0_observe: queueWait("AWTSMOOS_P0_OBSERVE_QUEUE_WAIT_MS", 10 * SECOND),
	p1_fs_light: queueWait("AWTSMOOS_P1_QUEUE_WAIT_MS", 10 * SECOND),
	p2_chrome_light: queueWait("AWTSMOOS_P2_QUEUE_WAIT_MS", 15 * SECOND),
	p3_heavy: queueWait("AWTSMOOS_P3_QUEUE_WAIT_MS", 20 * SECOND),
	p4_bulk: queueWait("AWTSMOOS_P4_QUEUE_WAIT_MS", 25 * SECOND)
});

function queueWait(name, fallback) {
	return boundedNumber(process.env[name], fallback, SECOND, 5 * MINUTE);
}

module.exports = {
	DAY,
	HOUR,
	LANE_TIMEOUT_MS,
	MINUTE,
	QUEUE_WAIT_TIMEOUT_MS,
	SECOND,
	boundedNumber
};
