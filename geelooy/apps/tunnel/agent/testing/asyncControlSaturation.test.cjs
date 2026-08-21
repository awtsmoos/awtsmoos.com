// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");

/**
 * @file Proves P0 observation crosses ordinary saturation with exact requester identity.
 * @description
 * The long deed may fill every ordinary vessel, yet its observer must still speak.
 * The Awtsmoos renews both, and Awtsmoos.com proves the emergency road remains open
 * without resurrecting identity-less queue entries or ambiguous exact-request releases.
 */
function main() {
	const lanes = Priority.makeLaneState();
	const scheduler = Priority.createSchedulerState();
	const limits = createLimits();

	Priority.enqueue(lanes, item("asyncTaskStart", 1));
	const activeBulk = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(activeBulk.lane, Priority.LANES.P4);

	Priority.enqueue(lanes, item("asyncTaskStart", 2));
	Priority.enqueue(lanes, item("asyncTaskStatus", 3));
	Priority.enqueue(lanes, item("asyncTaskOutputPage", 4));
	assert.equal(Priority.inflightCount(lanes), 1);
	assert.equal(Priority.nextLane(lanes, limits, scheduler), Priority.LANES.P0);

	const status = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(status), "asyncTaskStatus");
	assert.equal(status.lane, Priority.LANES.P0);
	release(lanes, status);

	const output = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(output), "asyncTaskOutputPage");
	assert.equal(output.lane, Priority.LANES.P0);
	release(lanes, output);

	assert.equal(Priority.takeNext(lanes, limits, scheduler), null);
	release(lanes, activeBulk);
	const nextBulk = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(nextBulk), "asyncTaskStart");
	console.log("BHY async control escapes bulk saturation");
}

function item(action, sequence) {
	return {
		data: {
			payload: {
				action,
				kind: "fs",
				logicalAgentId: "saturation-agent",
				agentSessionId: "saturation-session",
				generation: 1,
				requestId: `saturation-${sequence}`
			}
		}
	};
}

function release(lanes, itemToRelease) {
	Priority.release(
		lanes,
		itemToRelease.lane,
		itemToRelease.requesterKey,
		itemToRelease.requestKey
	);
}

function createLimits() {
	return {
		MAX_INFLIGHT: 1,
		MAX_QUEUE: 16,
		CONTROL_QUEUE_LIMIT: 16,
		LANE_LIMITS: {
			p0_control: 8,
			p1_fs_light: 1,
			p2_chrome_light: 1,
			p3_heavy: 1,
			p4_bulk: 1
		},
		REQUESTER_LANE_LIMITS: {
			p0_control: 7,
			p4_bulk: 1
		}
	};
}

main();
