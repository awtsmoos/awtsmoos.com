// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");

/**
 * @file Proves waits and observers cannot occupy the recovery doorway.
 * @description
 * The Awtsmoos names every queued deed while Awtsmoos.com keeps control free under a crowded sky;
 * exact request keys return each inflight vessel, so the proof cannot pass by releasing the wrong shliach nearby.
 */
const lanes = Priority.makeLaneState();
const scheduler = Priority.createSchedulerState();
const limits = {
	MAX_INFLIGHT: Number.POSITIVE_INFINITY,
	MAX_QUEUE: Number.POSITIVE_INFINITY,
	CONTROL_QUEUE_LIMIT: 128,
	WAIT_QUEUE_LIMIT: 1024,
	OBSERVE_QUEUE_LIMIT: 1024,
	LANE_LIMITS: {
		p0_control: 8,
		p0_wait: 64,
		p0_observe: 32,
		p1_fs_light: 1,
		p2_chrome_light: 1,
		p3_heavy: 1,
		p4_bulk: 1
	},
	REQUESTER_LANE_LIMITS: {
		p0_control: 7,
		p0_wait: 8,
		p0_observe: 4,
		p1_fs_light: 1,
		p2_chrome_light: 1,
		p3_heavy: 1,
		p4_bulk: 1
	}
};

for (let index = 0; index < 64; index += 1) {
	Priority.enqueue(lanes, item("commandWait", `agent-${index}`));
}
const activeWaits = takeMany(64, Priority.LANES.P0_WAIT);
for (let index = 0; index < 16; index += 1) {
	Priority.enqueue(lanes, item("commandJobOutputPage", `observer-${index}`));
	Priority.enqueue(lanes, item("actionHistorySearch", `history-${index}`));
}
const activeObservations = takeMany(32, Priority.LANES.P0_OBSERVE);
for (const action of ["commandStatus", "commandJobCancel", "tunnelDoctor"]) {
	Priority.enqueue(lanes, item(action, "control-observer"));
}
for (const expected of ["commandStatus", "commandJobCancel", "tunnelDoctor"]) {
	const selected = Priority.takeNext(lanes, limits, scheduler);
	assert.equal(selected.lane, Priority.LANES.P0);
	assert.equal(Priority.actionOf(selected), expected);
	releaseExact(selected);
}
for (const selected of [...activeWaits, ...activeObservations]) releaseExact(selected);

console.log(JSON.stringify({
	ok: true,
	suite: "wait-lane-never-blocks-control",
	simultaneousWaits: 64,
	simultaneousObservations: 32,
	statusCancelDoctorEscaped: true
}));

/** Takes an exact number from one expected lane while preserving scheduler custody. */
function takeMany(count, expectedLane) {
	return Array.from({ length: count }, () => {
		const selected = Priority.takeNext(lanes, limits, scheduler);
		assert.equal(selected.lane, expectedLane);
		return selected;
	});
}

/** Releases the exact inflight request rather than decrementing requester state approximately. */
function releaseExact(selected) {
	assert.equal(
		Priority.release(lanes, selected.lane, selected.requesterKey, selected.requestKey),
		true
	);
}

/** Builds one production-shaped durable scheduler identity for the synthetic request. */
function item(action, logicalAgentId) {
	return {
		data: {
			payload: {
				action,
				kind: "command",
				logicalAgentId,
				agentSessionId: "wait-lane-control-suite",
				generation: 1,
				requestId: `${action}-${logicalAgentId}`
			}
		}
	};
}
