// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Snapshot = require("./missionSnapshotService.js");

/**
 * @file Proves Tunnel Control sees live checkpoint and successor truth through its existing authorized mission vessel.
 * @description The Awtsmoos lets observation illuminate the mission without owning it; Awtsmoos.com adds one bounded
 * read-only projection to the same snapshot stream, preserving authority, timeline, history, and graceful degradation.
 */
test("authorized mission snapshot includes native live progress", async () => {
	const calls = [];
	const result = await Snapshot.readMissionRoomSnapshot(sender(calls), options());
	assert.equal(result.ok, true);
	assert.deepEqual(calls.map(call => call.action).sort(), [
		"actionHistoryList",
		"missionLiveProgress",
		"missionProjectStatus",
		"missionTimeline"
	].sort());
	assert.ok(calls.every(call => call.targetVessel === "native-tunnel" && call.p === "."));
	assert.equal(result.liveProgress.missionId, "mission-live");
	assert.equal(result.liveProgress.continuation.predecessorAgentId, "worker-old");
	assert.equal(result.liveProgress.continuation.successorAgentId, "worker-new");
	assert.equal(result.liveProgress.recoveryCheckpoint.unfinishedTasks[0].id, "task-open");
	assert.equal(result.timeline.length, 1);
	assert.equal(result.actionHistory.length, 1);
	assert.deepEqual(result.warnings, []);
});

test("live-progress failure warns without destroying mission snapshot", async () => {
	const calls = [];
	const result = await Snapshot.readMissionRoomSnapshot(sender(calls, true), options());
	assert.equal(result.ok, true);
	assert.equal(result.liveProgress, null);
	assert.deepEqual(result.warnings, ["live_progress_unavailable"]);
	assert.equal(result.timeline.length, 1);
	assert.equal(result.actionHistory.length, 1);
});

function sender(calls, failProgress = false) {
	return async payload => {
		calls.push({ ...payload });
		if (payload.action === "missionProjectStatus") {
			return { ok: true, collaboration: { agents: { worker: { agentId: "worker" } } } };
		}
		if (payload.action === "missionTimeline") {
			return { ok: true, timeline: [{ id: "timeline-1" }] };
		}
		if (payload.action === "actionHistoryList") {
			return { ok: true, history: [{ actionId: "a1", action: "missionStepExecute", ok: true }] };
		}
		if (payload.action === "missionLiveProgress") {
			if (failProgress) throw new Error("progress_temporarily_unavailable");
			return {
				ok: true,
				liveProgress: {
					missionId: "mission-live",
					recoveryCheckpoint: { unfinishedTasks: [{ id: "task-open" }] },
					continuation: { predecessorAgentId: "worker-old", successorAgentId: "worker-new" }
				}
			};
		}
		throw new Error(`unexpected_action:${payload.action}`);
	};
}

function options() {
	return {
		missionId: "mission-live",
		roomId: "room-live",
		historyLimit: 25,
		logicalAgentId: "observer-agent",
		agentSessionId: "observer-session"
	};
}
