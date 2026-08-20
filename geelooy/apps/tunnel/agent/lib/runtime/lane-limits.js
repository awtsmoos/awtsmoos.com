// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const Time = require("./limit-timeouts.js");

const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);

/**
 * @file Owns physical lane, active-requester, and pending-requester ceilings.
 * @description
 * The Awtsmoos gives every shliach a current without surrendering the whole sea.
 * Awtsmoos.com bounds both running and waiting work per requester, so abundance
 * remains possible for hundreds while one flood can slow only its own vessel.
 */
const LANE_LIMITS = Object.freeze({
	p0_control: number("AWTSMOOS_P0_INFLIGHT", 8, 1, 64),
	p0_wait: number("AWTSMOOS_P0_WAIT_INFLIGHT", Math.min(128, Math.max(32, CPU_COUNT * 4)), 1, 256),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_INFLIGHT", Math.min(64, Math.max(16, CPU_COUNT * 2)), 1, 128),
	p1_fs_light: number("AWTSMOOS_P1_INFLIGHT", Math.min(32, Math.max(4, CPU_COUNT * 2)), 1, 128),
	p2_chrome_light: number("AWTSMOOS_P2_INFLIGHT", 4, 1, 32),
	p3_heavy: number("AWTSMOOS_P3_INFLIGHT", Math.min(32, Math.max(4, CPU_COUNT)), 1, 128),
	p4_bulk: number("AWTSMOOS_P4_INFLIGHT", 2, 1, 32)
});

const REQUESTER_LANE_LIMITS = Object.freeze({
	p0_control: requester("AWTSMOOS_P0_PER_REQUESTER", LANE_LIMITS.p0_control),
	p0_wait: number("AWTSMOOS_P0_WAIT_PER_REQUESTER", Math.min(8, LANE_LIMITS.p0_wait), 1, LANE_LIMITS.p0_wait),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_PER_REQUESTER", Math.min(4, LANE_LIMITS.p0_observe), 1, LANE_LIMITS.p0_observe),
	p1_fs_light: requester("AWTSMOOS_P1_PER_REQUESTER", LANE_LIMITS.p1_fs_light),
	p2_chrome_light: requester("AWTSMOOS_P2_PER_REQUESTER", LANE_LIMITS.p2_chrome_light),
	p3_heavy: requester("AWTSMOOS_P3_PER_REQUESTER", LANE_LIMITS.p3_heavy),
	p4_bulk: requester("AWTSMOOS_P4_PER_REQUESTER", LANE_LIMITS.p4_bulk)
});

const REQUESTER_QUEUE_LIMITS = Object.freeze({
	p0_control: number("AWTSMOOS_P0_QUEUE_PER_REQUESTER", 64, 1, 4096),
	p0_wait: number("AWTSMOOS_P0_WAIT_QUEUE_PER_REQUESTER", 64, 1, 4096),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_QUEUE_PER_REQUESTER", 64, 1, 4096),
	p1_fs_light: number("AWTSMOOS_P1_QUEUE_PER_REQUESTER", 128, 1, 4096),
	p2_chrome_light: number("AWTSMOOS_P2_QUEUE_PER_REQUESTER", 16, 1, 1024),
	p3_heavy: number("AWTSMOOS_P3_QUEUE_PER_REQUESTER", 16, 1, 1024),
	p4_bulk: number("AWTSMOOS_P4_QUEUE_PER_REQUESTER", 4, 1, 256)
});

function requester(name, laneLimit) {
	const fallback = laneLimit > 1 ? laneLimit - 1 : 1;
	return number(name, fallback, 1, laneLimit);
}

function number(name, fallback, minimum, maximum) {
	return Time.boundedNumber(process.env[name], fallback, minimum, maximum);
}

module.exports = {
	CPU_COUNT,
	LANE_LIMITS,
	REQUESTER_LANE_LIMITS,
	REQUESTER_QUEUE_LIMITS,
	requester
};
