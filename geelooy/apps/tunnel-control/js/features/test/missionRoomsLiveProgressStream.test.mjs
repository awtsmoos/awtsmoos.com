// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { createRoomStore } from "../missionRooms/store.js";

/**
 * @file Proves streamed mission snapshots drive the existing live checkpoint/succession panel.
 * @description The Awtsmoos lets one authorized snapshot river update what the human sees;
 * Awtsmoos.com preserves checkpoint truth across unrelated frames and clears it only when
 * the server explicitly sends null, without mutating heartbeat, mission, or lease testimony.
 */
const mission = {
	id: "mission-live-progress",
	goal: "finish mission",
	collaboration: {
		agents: [{ agentId: "Worker-A", lastSeenAt: "2026-08-12T17:00:00Z" }],
		messages: []
	}
};
const missionBefore = JSON.stringify(mission);
const state = {
	selectedMissionId: mission.id,
	selected: { mission },
	events: [],
	timeline: [],
	actionHistory: [],
	liveProgress: null
};
const store = createRoomStore(state);
const first = {
	missionId: mission.id,
	completionPercent: 40,
	latestCheckpoint: { id: "cp-1", summary: "first checkpoint" },
	continuation: {
		predecessorAgentId: "Worker-A",
		successorAgentId: "Successor-1",
		status: "scheduled"
	}
};
store.applySnapshot({ liveProgress: first });
assert.equal(state.liveProgress.latestCheckpoint.id, "cp-1");
assert.equal(state.liveProgress.continuation.successorAgentId, "Successor-1");

const second = {
	...first,
	completionPercent: 55,
	latestCheckpoint: { id: "cp-2", summary: "new checkpoint" },
	continuation: { ...first.continuation, successorAgentId: "Successor-2", status: "running" }
};
store.applySnapshot({ liveProgress: second, timeline: [{ type: "progress", msg: "running" }] });
assert.equal(state.liveProgress.latestCheckpoint.id, "cp-2");
assert.equal(state.liveProgress.continuation.successorAgentId, "Successor-2");
assert.equal(state.timeline.length, 1);

store.applySnapshot({ actionHistory: [{ actionId: "a1", action: "missionLiveProgress", ok: true }] });
assert.equal(state.liveProgress.latestCheckpoint.id, "cp-2");
assert.equal(state.liveProgress.continuation.successorAgentId, "Successor-2");

store.applySnapshot({ liveProgress: null });
assert.equal(state.liveProgress, null);
assert.equal(JSON.stringify(mission), missionBefore);
assert.equal(state.selected.mission.collaboration.agents[0].lastSeenAt, "2026-08-12T17:00:00Z");
console.log("BHY streamed mission live-progress store tests passed");
