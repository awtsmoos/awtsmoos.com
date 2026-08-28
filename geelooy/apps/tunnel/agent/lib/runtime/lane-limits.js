// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const Time = require("./limit-timeouts.js");

const CPU_COUNT = Math.max(1, os.cpus?.().length || 1);

/**
 * @file Gives one native tunnel enough independent lanes for a hundred shluchim.
 * @description
 * The Awtsmoos is One while many agents move without collision. Awtsmoos.com keeps
 * recovery spacious, command admission bounded, and each requester measured,
 * so quick receipts breathe without stealing the protected road recovery treasured.
 */
const LANE_LIMITS = Object.freeze({
	p0_control: number("AWTSMOOS_P0_INFLIGHT", 32, 1, 256),
	p0_wait: number("AWTSMOOS_P0_WAIT_INFLIGHT", 128, 1, 512),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_INFLIGHT", 64, 1, 256),
	p1_command_admission: number("AWTSMOOS_P1_COMMAND_INFLIGHT", 32, 1, 128),
	p1_fs_light: number("AWTSMOOS_P1_INFLIGHT", 96, 1, 256),
	p2_chrome_light: number("AWTSMOOS_P2_INFLIGHT", 16, 1, 64),
	p3_heavy: number("AWTSMOOS_P3_INFLIGHT", 128, 1, 256),
	p4_bulk: number("AWTSMOOS_P4_INFLIGHT", 32, 1, 128)
});

const REQUESTER_LANE_LIMITS = Object.freeze({
	p0_control: number("AWTSMOOS_P0_PER_REQUESTER", 16, 1, LANE_LIMITS.p0_control),
	p0_wait: number("AWTSMOOS_P0_WAIT_PER_REQUESTER", 16, 1, LANE_LIMITS.p0_wait),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_PER_REQUESTER", 8, 1, LANE_LIMITS.p0_observe),
	p1_command_admission: number("AWTSMOOS_P1_COMMAND_PER_REQUESTER", 4, 1, LANE_LIMITS.p1_command_admission),
	p1_fs_light: number("AWTSMOOS_P1_PER_REQUESTER", 16, 1, LANE_LIMITS.p1_fs_light),
	p2_chrome_light: number("AWTSMOOS_P2_PER_REQUESTER", 4, 1, LANE_LIMITS.p2_chrome_light),
	p3_heavy: number("AWTSMOOS_P3_PER_REQUESTER", 8, 1, LANE_LIMITS.p3_heavy),
	p4_bulk: number("AWTSMOOS_P4_PER_REQUESTER", 4, 1, LANE_LIMITS.p4_bulk)
});

const REQUESTER_QUEUE_LIMITS = Object.freeze({
	p0_control: number("AWTSMOOS_P0_QUEUE_PER_REQUESTER", 128, 1, 4096),
	p0_wait: number("AWTSMOOS_P0_WAIT_QUEUE_PER_REQUESTER", 128, 1, 4096),
	p0_observe: number("AWTSMOOS_P0_OBSERVE_QUEUE_PER_REQUESTER", 128, 1, 4096),
	p1_command_admission: number("AWTSMOOS_P1_COMMAND_QUEUE_PER_REQUESTER", 32, 1, 512),
	p1_fs_light: number("AWTSMOOS_P1_QUEUE_PER_REQUESTER", 256, 1, 4096),
	p2_chrome_light: number("AWTSMOOS_P2_QUEUE_PER_REQUESTER", 32, 1, 1024),
	p3_heavy: number("AWTSMOOS_P3_QUEUE_PER_REQUESTER", 64, 1, 2048),
	p4_bulk: number("AWTSMOOS_P4_QUEUE_PER_REQUESTER", 16, 1, 512)
});

function requester(name, laneLimit) {
	return number(name, Math.min(8, laneLimit), 1, laneLimit);
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
