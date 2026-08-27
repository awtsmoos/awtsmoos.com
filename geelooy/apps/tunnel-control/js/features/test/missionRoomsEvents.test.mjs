// B"H
import assert from "assert";
import { normalizeRoomEvent, eventsFromRoom, eventsFromTimeline, eventsFromActionHistory, uniqueEvents, roomStatusLabel } from "../missionRooms/events.js";
import { createRoomStore, metrics, selectedRoom, selectedMission } from "../missionRooms/store.js";
import { activityRows, fileRows, agentRows, actionRows } from "../missionRooms/activity.js";
import { eventApiPayload, inspectorSections, apiSnippets, replayPayload } from "../missionRooms/inspector.js";
import { replayStep, replayLive, replayEvents } from "../missionRooms/replay.js";
import { reviewItems, setReview } from "../missionRooms/review.js";
import { templateGoal } from "../missionRooms/templates.js";

global.location = { origin: "https://awtsmoos.com" };

const event = normalizeRoomEvent({ missionId: "m1", fromAgent: "planner", kind: "write", path: "render.js", body: "done", at: "2026-01-01T00:00:00Z" });
assert.equal(event.roomId, "m1"); assert.equal(event.actor, "planner"); assert.equal(event.type, "write"); assert.equal(event.title, "done");
assert(templateGoal("bug").includes("bug"));

const roomEvents = eventsFromRoom({ messages: [{ fromAgent: "a", body: "hi", at: "2026-01-01T00:00:01Z" }], userMessages: [{ body: "yo", at: "2026-01-01T00:00:02Z" }] }, "m1");
assert.equal(roomEvents.length, 2); assert(roomEvents.every(row => row.roomId === "m1"));

const timeline = eventsFromTimeline([{ type: "claim", msg: "claimed", at: "2026-01-01T00:00:03Z" }], "m1");
assert.equal(timeline[0].type, "claim"); assert.equal(uniqueEvents([timeline[0], timeline[0]]).length, 1); assert.equal(roomStatusLabel({ collaboration: { openUserMessages: [{}] } }), "needs human");

const history = eventsFromActionHistory([{ actionId: "act1", action: "write", ok: true, createdAt: "2026-01-01T00:00:04Z", outputRef: ".awtsmoos/actions/results/act1.json", input: { action: "write", path: "a.js", content: "hi", agentId: "writer" } }, { actionId: "act2", action: "chromeNavigate", ok: false, createdAt: "2026-01-01T00:00:05Z", input: { action: "chromeNavigate", url: "https://example.com" } }], "m1");
assert.equal(history[0].type, "action:filesystem"); assert.equal(history[1].status, "failed");

const state = { selectedMissionId: "m1", events: [], timeline: [], actionHistory: [], reviewDecisions: {} };
const store = createRoomStore(state);
store.setSelected({ mission: { id: "m1", goal: "Goal", collaboration: { agents: [{ agentId: "a" }], messages: [{ fromAgent: "a", body: "hello" }] } } });
store.applySnapshot({ missionId: "m1", timeline: [{ type: "read", path: "b.js", msg: "read" }], actionHistory: [{ actionId: "act3", action: "command", ok: true, createdAt: "2026-01-01T00:00:06Z", input: { action: "command", command: "echo ok", cwd: ".", agentId: "tester" } }], roomOs: { metrics: { agents: 1, actions: 1, command: 1, filesystem: 0, browser: 0, failed: 0 } } });
assert.equal(selectedMission(state).goal, "Goal"); assert.equal(selectedRoom(state).agents.length, 1); assert.equal(metrics(state).command, 1);
assert(activityRows(state, "echo").length >= 1); assert(actionRows(state, "command").length === 1); assert(agentRows(state).length >= 1);
store.applySnapshot({ actionHistory: [{ actionId: "act4", action: "write", ok: true, createdAt: "2026-01-01T00:00:07Z", input: { action: "write", path: "a.js", agentId: "writer" } }] });
assert(fileRows(state).some(f => f.path === "a.js"));

const picked = activityRows(state, "act4")[0];
assert(inspectorSections(picked).some(s => s.title === "Replay payload")); assert.equal(eventApiPayload(picked).action, "write"); assert.equal(replayPayload(picked).actionId, "act4"); assert(apiSnippets(picked).curl.includes("curl"));
assert(reviewItems(state).length >= 1); setReview(state, reviewItems(state)[0].id, "approved"); assert.equal(reviewItems(state)[0].status, "approved");
state.replayEnabled = true; state.replayIndex = 0; assert.equal(replayEvents(state).length, 1); replayStep(state, 1); assert(replayEvents(state).length >= 2); replayLive(state); assert.equal(state.replayEnabled, false);
console.log("BHY mission room action-history event/store/inspector/replay/review tests passed");
