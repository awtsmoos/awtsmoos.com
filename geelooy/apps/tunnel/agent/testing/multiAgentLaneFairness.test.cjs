// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Priority = require("../lib/runtime/priority.js");
const Scheduler = require("../lib/runtime/priority/laneScheduler.js");

/**
 * @file Proves one busy logical agent cannot monopolize a lane or weighted service ring.
 * @description
 * The Awtsmoos renews each requester while Awtsmoos.com keeps exact deeds beneath one fair name;
 * public dequeue and exact release prove requester limits without reaching through a private frame.
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
const scheduler = Priority.createSchedulerState();
for (let index = 0; index < 4; index += 1) {
	Priority.enqueue(lanes, request("agent-a", `a-${index}`));
}
Priority.enqueue(lanes, request("agent-b", "b-0"));

const selected = Array.from({ length: 4 }, () => Priority.takeNext(
	lanes,
	limits,
	scheduler
));
assert.equal(selected.filter(item => item.requesterKey.includes("agent-a")).length, 3);
assert.equal(selected.filter(item => item.requesterKey.includes("agent-b")).length, 1);
assert.equal(selected[1].requesterKey.includes("agent-b"), true);
assert.equal(Priority.takeNext(lanes, limits, scheduler), null);
assert.equal(Priority.release(
	lanes,
	"p3_heavy",
	selected[0].requesterKey,
	selected[0].requestKey
), true);
const resumed = Priority.takeNext(lanes, limits, scheduler);
assert.equal(resumed.requesterKey.includes("agent-a"), true);
assert.equal(Priority.release(
	lanes,
	resumed.lane,
	resumed.requesterKey,
	resumed.requestKey
), true);

const ringScheduler = Scheduler.createSchedulerState();
const sequence = Array.from(
	{ length: Scheduler.SERVICE_RING.length },
	() => Scheduler.nextLane(ringScheduler, {}, () => true)
);
assert.equal(sequence.filter(lane => lane === "p0_control").length, 8);
assert.equal(sequence.filter(lane => lane === "p0_wait").length, 4);
assert.equal(sequence.filter(lane => lane === "p0_observe").length, 3);
assert.equal(sequence.filter(lane => lane === "p1_command_admission").length, 4);
assert.equal(sequence.filter(lane => lane === "p1_fs_light").length, 4);
assert.equal(sequence.filter(lane => lane === "p2_chrome_light").length, 2);
assert.equal(sequence.filter(lane => lane === "p3_heavy").length, 2);
assert.equal(sequence.filter(lane => lane === "p4_bulk").length, 1);
assert.equal(sequence.at(-1), "p4_bulk");

console.log(JSON.stringify({
	ok: true,
	suite: "multi-agent-lane-fairness",
	sequence
}, null, 2));

/** Builds one production-shaped request whose fairness owner is the logical agent. */
function request(logicalAgentId, requestId) {
	return {
		data: {
			id: requestId,
			payload: {
				action: "commandRun",
				kind: "command",
				logicalAgentId,
				agentSessionId: "multi-agent-fairness-suite",
				generation: 1,
				requestId
			}
		}
	};
}
