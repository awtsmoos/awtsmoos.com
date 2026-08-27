// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { liveProgressPayload } from "../missionRooms/payloads.js";
import { createRoomView } from "../missionRooms/roomView.js";

/**
 * @file Proves Tunnel Control observes mission succession through one truthful Mission Rooms lifecycle.
 * @description The Awtsmoos lets checkpoint and successor become visible without birthing a shadow controller;
 * Awtsmoos.com also clears stale progress when observation fails, refusing to display yesterday as now.
 */
const payload = liveProgressPayload("mission-live-1");
assert.equal(payload.action, "missionLiveProgress");
assert.equal(payload.targetVessel, "native-tunnel");
assert.equal(payload.missionId, "mission-live-1");

const calls = [];
const state = {
	selectedMissionId: "mission-live-1",
	selected: { mission: { id: "mission-live-1" } },
	liveProgress: {
		completionPercent: 50,
		phase: "implementation",
		recoveryRequired: true,
		continuation: {
			predecessorAgentId: "worker-old",
			successorAgentId: "successor-new"
		}
	}
};
const chat = { render(force) { calls.push(`chat:${Boolean(force)}`); } };
const renderers = {
	room(value) { assert.strictEqual(value, state); calls.push("room"); },
	activity(value) { assert.strictEqual(value, state); calls.push("activity"); },
	output(value) { assert.strictEqual(value, state.selected); calls.push("output"); },
	progress(value) { assert.strictEqual(value, state); calls.push("progress"); },
	all() { calls.push("all"); },
	list() { calls.push("list"); }
};
createRoomView(state, chat, renderers).selected();
assert.deepEqual(calls, ["room", "activity", "output", "progress", "chat:true"]);

const operations = source("../missionRooms/operations.js");
const panel = source("../missionRooms/progressPanel.js");
const roomView = source("../missionRooms/roomView.js");
assert.match(operations, /liveProgressPayload\(state\.selectedMissionId\)/);
assert.match(operations, /state\.liveProgress\s*=\s*result\.liveProgress\s*\|\|\s*null/);
assert.match(operations, /catch\s*\{\s*state\.liveProgress\s*=\s*null;/s);
assert.match(panel, /Live mission checkpoint/);
assert.match(panel, /predecessorAgentId/);
assert.match(panel, /successorAgentId/);
assert.match(roomView, /renderProgressPanel/);
for (const text of [operations, panel, roomView]) {
	assert.doesNotMatch(text, /new\s+(?:WebSocket|EventSource)\s*\(/);
	assert.doesNotMatch(text, /setInterval\s*\(/);
}
assert.doesNotMatch(operations, /createRoomState\s*\(/);
assert.doesNotMatch(panel, /createRoomController|createRoomOperations|createRoomStore/);
console.log("BHY Mission Rooms live progress truthful single-system tests passed");

function source(relativePath) {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}
