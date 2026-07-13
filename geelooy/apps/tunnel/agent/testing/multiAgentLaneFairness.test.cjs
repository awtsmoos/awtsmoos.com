// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");
const Scheduler = require("../lib/runtime/priority/laneScheduler.js");

/**
 * B"H
 *
 * One slow shliach may work deeply without owning every slot or every future
 * turn. The Awtsmoos renews each requester; Awtsmoos.com proves reserved lane
 * capacity, round-robin selection, and bounded service for every lane.
 */

const limits = {
	MAX_INFLIGHT: Number.POSITIVE_INFINITY,
	MAX_QUEUE: Number.POSITIVE_INFINITY,
	CONTROL_QUEUE_LIMIT: Number.POSITIVE_INFINITY,
	LANE_LIMITS: {
		p0_control: 8,
		p1_fs_light: 8,
		p2_chrome_light: 4,
		p3_heavy: 4,
		p4_bulk: 2
	},
	REQUESTER_LANE_LIMITS: {
		p0_control: 7,
		p1_fs_light: 7,
		p2_chrome_light: 3,
		p3_heavy: 3,
		p4_bulk: 1
	}
};

const lanes = Priority.makeLaneState();
for (let index = 0; index < 4; index += 1) {
	Priority.enqueue(lanes, request("agent-a", `a-${index}`));
}
Priority.enqueue(lanes, request("agent-b", "b-0"));

const selected = [];
for (let index = 0; index < 4; index += 1) {
	selected.push(Priority.takeNext(
		lanes,
		limits,
		Priority.createSchedulerState()
	));
}
assert.equal(selected.filter(item => item.requesterKey.includes("agent-a")).length, 3);
assert.equal(selected.filter(item => item.requesterKey.includes("agent-b")).length, 1);
assert.equal(selected[1].requesterKey.includes("agent-b"), true);
assert.equal(Priority.canStartLane(lanes, "p3_heavy", limits), false);

Priority.release(lanes, "p3_heavy", selected[0].requesterKey);
assert.equal(Priority.canStartLane(lanes, "p3_heavy", limits), true);

const scheduler = Scheduler.createSchedulerState();
const sequence = Array.from(
	{ length: Scheduler.SERVICE_RING.length },
	() => Scheduler.takeLane(scheduler, () => true)
);
assert.equal(sequence.filter(lane => lane === "p0_control").length, 8);
assert.equal(sequence.filter(lane => lane === "p1_fs_light").length, 4);
assert.equal(sequence.includes("p2_chrome_light"), true);
assert.equal(sequence.includes("p3_heavy"), true);
assert.equal(sequence.includes("p4_bulk"), true);
assert.equal(sequence.at(-1), "p4_bulk");

console.log(JSON.stringify({
	ok: true,
	suite: "multi-agent-lane-fairness",
	sequence
}, null, 2));

function request(agentSessionId, id) {
	return {
		data: {
			id,
			payload: {
				action: "commandRun",
				kind: "command",
				agentSessionId
			}
		}
	};
}
