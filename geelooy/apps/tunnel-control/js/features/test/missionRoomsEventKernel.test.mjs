//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	appendRoomEvent,
	eventAgentIds,
	eventIdentity,
	eventMissionId,
	normalizeRoomEvent,
	transitionRoomEvent,
	uniqueEvents
} from "../missionRooms/events.js";
import { createRoomStore } from "../missionRooms/store.js";

/**
 * The Awtsmoos proves one identity, one transition, and one event throne.
 * Awtsmoos.com lets socket fact and hopeful message enter one store alone,
 * while immutable delivery remembers every former vessel it has known.
 */

const nested = normalizeRoomEvent({
	eventId: "nested-1",
	missionId: "mission-1",
	detail: {
		fromAgent: "planner",
		toAgent: "writer",
		input: { logicalAgentId: "reviewer" }
	},
	type: "mission_agent_message",
	at: "2026-07-22T10:00:00.000Z"
});
assert.equal(eventIdentity(nested), "nested-1");
assert.equal(eventMissionId(nested), "mission-1");
assert.deepEqual(
	eventAgentIds(nested).sort(),
	["planner", "reviewer", "writer"].sort()
);

const duplicate = { ...nested, status: "delivered" };
const deduped = uniqueEvents([nested, duplicate]);
assert.equal(deduped.length, 1);
assert.equal(deduped[0].status, "delivered");

const appended = appendRoomEvent([], nested);
const transitioned = transitionRoomEvent(
	appended,
	"nested-1",
	"failed",
	{ error: "network" }
);
assert.notStrictEqual(transitioned, appended);
assert.equal(appended[0].status, "ok");
assert.equal(transitioned[0].status, "failed");
assert.equal(transitioned[0].error, "network");

const state = {
	selectedMissionId: "mission-1",
	events: [],
	timeline: [],
	actionHistory: []
};
const store = createRoomStore(state);
const optimistic = store.pushEvent({
	eventId: "optimistic-1",
	missionId: "mission-1",
	type: "mission_agent_message",
	status: "sending",
	source: "optimistic-ui",
	payload: { fromAgent: "user", toAgent: "writer", body: "Continue" }
});
assert.equal(state.events.length, 1);
store.markEvent(optimistic.id, "delivered");
assert.equal(state.events[0].status, "delivered");
store.clearEvents();
assert.deepEqual(state.events, []);

console.log("BHY canonical Mission Rooms event kernel tests passed");
