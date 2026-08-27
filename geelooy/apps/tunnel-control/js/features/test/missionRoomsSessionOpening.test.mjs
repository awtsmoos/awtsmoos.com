// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	applyRoomOpening,
	loadRoomForSession
} from "../missionRooms/roomOpening.js";

/**
 * @file Proves opening an existing room is read-only for a signed browser session.
 * @description
 * The Awtsmoos renews observer and participant without confusing their permissions.
 * Awtsmoos.com loads status and timeline, never joins an agent, and leaves all room
 * mutations behind the explicit API-key gate.
 */
const actions = [];
const api = async payload => {
	actions.push(payload.action);
	if (payload.action === "missionProjectStatus") {
		return { ok: true, mission: { id: "mission-session-room" } };
	}
	if (payload.action === "missionTimeline") {
		return { ok: true, timeline: [{ id: "event-one" }] };
	}
	throw new Error(`unexpected_action:${payload.action}`);
};

const opening = await loadRoomForSession(
	api,
	"mission-session-room",
	{ projectRoot: "/tmp/project", agentId: "human-browser" }
);
assert.deepEqual(actions, ["missionProjectStatus", "missionTimeline"]);
assert.equal(actions.includes("missionProjectJoin"), false);
assert.equal(opening.missionId, "mission-session-room");
assert.deepEqual(opening.timeline, [{ id: "event-one" }]);

const state = {};
const calls = [];
const store = {
	setSelected(value) { calls.push(["selected", value]); },
	setTimeline(value) { calls.push(["timeline", value]); }
};
const result = applyRoomOpening(state, store, opening);
assert.equal(state.selectedMissionId, "mission-session-room");
assert.equal(result.ok, true);
assert.deepEqual(calls.map(call => call[0]), ["selected", "timeline"]);

console.log(JSON.stringify({
	ok: true,
	suite: "mission-rooms-session-opening",
	readOnlyOpen: true,
	joinMutationAbsent: true
}, null, 2));
