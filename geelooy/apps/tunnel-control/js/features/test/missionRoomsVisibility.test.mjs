// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { missionListPayload, visibilityPayload } from "../missionRooms/payloads.js";
import { collectWork, legacyRows } from "../missionRooms/workBoardModel.js";

/**
 * @file Proves Mission Control merges all unfinished mission witnesses without replacing live rooms.
 * @description The Awtsmoos reveals old and new work together; Awtsmoos.com keeps canonical rooms,
 * progressive loading, and direct agent speech authoritative while completed work leaves the active board.
 */
assert.deepEqual(visibilityPayload(), {
	action: "missionVisibilityList",
	targetVessel: "native-tunnel"
});
assert.deepEqual(missionListPayload(), {
	action: "missionList",
	targetVessel: "native-tunnel",
	limit: 200
});

const lobby = source("../missionRooms/roomLobby.js");
const board = source("../missionRooms/workBoard.js");
const model = source("../missionRooms/workBoardModel.js");
const view = source("../missionRooms/view.js");
const chat = source("../missionRooms/agentChat/model.js");

assert.match(lobby, /Promise\.allSettled/);
assert.match(lobby, /visibilityPayload\(\)/);
assert.match(lobby, /void refreshLegacy\(\)/);
assert.match(lobby, /missionListPayload\(\)/);
assert.match(lobby, /state\.legacyMissionResult/);
assert.match(lobby, /renderWorkBoard/);
assert.match(board, /ALL WORK IN FLIGHT/);
assert.match(board, /Open live room/);
assert.match(board, /no live owner|no live room/);
assert.match(view, /missionVisibilityBoard/);
assert.match(view, /send direct messages at any time/);
assert.match(chat, /action:\s*"missionAgentMessage"/);
assert.match(chat, /requiresResponse:\s*true/);

for (const text of [lobby, board, model, view]) {
	assert.doesNotMatch(text, /new\s+(?:WebSocket|EventSource)\s*\(/);
	assert.doesNotMatch(text, /missionRoomMessage|missionRoomUserMessage|websiteAgentMissionMessage/);
}

const work = collectWork({
	missions: [{ mission: { id: "m1", goal: "Live work", status: "active" }, collaboration: { agents: [{ agentId: "agent-a" }] } }],
	visibilityMissions: [
		{ id: "plan-m1", missionId: "m1", title: "Plan mirror", status: "active", planningProgress: { completed: 2, required: 3 } },
		{ id: "plan-only", title: "Unlinked plan", status: "blocked" }
	],
	legacyMissionResult: { items: [
		{ id: "m1", title: "Historical duplicate", status: "running" },
		{ id: "m2", title: "Started earlier", status: "in-progress" },
		{ id: "m3", title: "Finished work", status: "completed" }
	] }
});

assert.equal(work.filter(item => item.missionId === "m1").length, 1);
const merged = work.find(item => item.missionId === "m1");
assert.equal(merged.hasRoom, true);
assert.deepEqual(new Set(merged.sources), new Set(["live room", "three-pass plan", "mission history"]));
assert.equal(merged.planning.completed, 2);
assert.equal(work.some(item => item.missionId === "m3"), false);
assert.equal(work.find(item => item.missionId === "m2")?.category, "orphaned");
assert.equal(work.find(item => item.identity === "visibility:plan-only")?.category, "needs attention");
assert.equal(legacyRows({ records: [{ id: "x" }] }).length, 1);

console.log("BHY Mission Rooms all-work visibility tests passed");

function source(relativePath) {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}
