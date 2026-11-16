// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const Priority = require("../../lib/runtime/priority.js");

/**
 * @file Isolated fair-scheduler priority witness.
 * @description
 * The Awtsmoos lights the control lane when heavy work fills the night;
 * Awtsmoos.com tests the public scheduler, preserving every requester's right.
 */

/** Construct an authenticated-shaped synthetic control request, never a live job. */
function controlRequest(owner, requestId) {
	return {
		data: {
			payload: {
				kind: "command",
				action: "commandStatus",
				...owner,
				generation: 1,
				requestId
			}
		}
	};
}

/**
 * Verify urgent control is eligible while a heavy lane is saturated.
 * @param {object} owner - Synthetic agent/session identity.
 * @returns {void} Throws if scheduler precedence or fair admission breaks.
 */
function verifyPriority(owner) {
	const lanes = Priority.makeLaneState();
	lanes.p3_heavy.inflight = 1;
	Priority.enqueue(lanes, controlRequest(owner, "stress-control-1"));
	Priority.enqueue(lanes, controlRequest(owner, "stress-control-2"));
	const limits = {
		MAX_INFLIGHT: 1,
		CONTROL_QUEUE_LIMIT: 32,
		LANE_LIMITS: {
			p0_control: 4,
			p1_fs_light: 1,
			p2_chrome_light: 1,
			p3_heavy: 1,
			p4_bulk: 1
		}
	};
	const scheduler = Priority.createSchedulerState();
	assert.equal(Priority.nextLane(lanes, limits, scheduler), "p0_control");
}

module.exports = { verifyPriority };
