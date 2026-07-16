// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");

/**
 * B"H
 * The long deed may fill every ordinary vessel, yet its observer must still
 * speak. The Awtsmoos renews both; Awtsmoos.com reserves a control road that
 * crosses global saturation without stealing the occupied bulk worker.
 */
function main() {
	const lanes = Priority.makeLaneState();
	const scheduler = Priority.createSchedulerState();
	const limits = createLimits();
	const requester = "agentSessionId:saturation-test";

	Priority.enqueue(lanes, item("asyncTaskStart", requester));
	const activeBulk = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(activeBulk.lane, Priority.LANES.P4);

	Priority.enqueue(lanes, item("asyncTaskStart", requester));
	Priority.enqueue(lanes, item("asyncTaskStatus", requester));
	Priority.enqueue(lanes, item("asyncTaskOutputPage", requester));

	assert.equal(Priority.inflightCount(lanes), 1);
	assert.equal(Priority.nextLane(lanes, limits, scheduler), Priority.LANES.P0);

	const status = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(status), "asyncTaskStatus");
	assert.equal(status.lane, Priority.LANES.P0);
	Priority.release(lanes, status.lane, status.requesterKey);

	const output = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(output), "asyncTaskOutputPage");
	assert.equal(output.lane, Priority.LANES.P0);
	Priority.release(lanes, output.lane, output.requesterKey);

	assert.equal(Priority.takeNext(lanes, limits, scheduler), null);
	Priority.release(lanes, activeBulk.lane, activeBulk.requesterKey);

	const nextBulk = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(Priority.actionOf(nextBulk), "asyncTaskStart");
	console.log("BHY async control escapes bulk saturation");
}

function item(action, requesterKey) {
	return {
		data: {
			payload: { action, kind: "fs", requesterKey }
		}
	};
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
