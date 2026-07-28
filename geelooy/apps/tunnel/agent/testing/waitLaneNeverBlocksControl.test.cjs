// B"H

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");

const lanes = Priority.makeLaneState();
const scheduler = Priority.createSchedulerState();
const limits = {
	MAX_INFLIGHT: Number.POSITIVE_INFINITY,
	MAX_QUEUE: Number.POSITIVE_INFINITY,
	CONTROL_QUEUE_LIMIT: 128,
	WAIT_QUEUE_LIMIT: 1024,
	LANE_LIMITS: {
		p0_control: 8,
		p0_wait: 64,
		p1_fs_light: 1,
		p2_chrome_light: 1,
		p3_heavy: 1,
		p4_bulk: 1
	},
	REQUESTER_LANE_LIMITS: {
		p0_control: 7,
		p0_wait: 8,
		p1_fs_light: 1,
		p2_chrome_light: 1,
		p3_heavy: 1,
		p4_bulk: 1
	}
};

for (let index = 0; index < 64; index += 1) {
	Priority.enqueue(lanes, item("commandWait", `agent-${index}`));
}
const activeWaits = [];
for (let index = 0; index < 64; index += 1) {
	const selected = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(selected.lane, Priority.LANES.P0_WAIT);
	activeWaits.push(selected);
}
Priority.enqueue(lanes, item("commandStatus", "observer"));
Priority.enqueue(lanes, item("commandJobOutputPage", "observer"));
Priority.enqueue(lanes, item("tunnelDoctor", "observer"));

for (const expected of ["commandStatus", "commandJobOutputPage", "tunnelDoctor"]) {
	const selected = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(selected.lane, Priority.LANES.P0);
	assert.equal(Priority.actionOf(selected), expected);
	Priority.release(lanes, selected.lane, selected.requesterKey);
}
for (const selected of activeWaits) {
	Priority.release(lanes, selected.lane, selected.requesterKey);
}

console.log(JSON.stringify({
	ok: true,
	suite: "wait-lane-never-blocks-control",
	simultaneousWaits: 64,
	statusOutputDoctorEscaped: true
}));

function item(action, requesterKey) {
	return { data: { payload: { action, kind: "command", requesterKey } } };
}
