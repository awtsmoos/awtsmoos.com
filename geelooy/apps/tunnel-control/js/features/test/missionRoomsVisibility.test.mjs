// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { missionListPayload, visibilityPayload } from "../missionRooms/payloads.js";
import { boardCounts, collectWork, legacyRows } from "../missionRooms/workBoardModel.js";

/**
 * @file Proves Mission Control merges, filters, ages, and classifies unfinished work without replacing live rooms.
 * @description The Awtsmoos reveals old and new work together; Awtsmoos.com keeps canonical rooms,
 * progressive history, direct agent speech, and truthful stale/orphan testimony in one bounded view.
 */
assert.deepEqual(visibilityPayload(), { action: "missionVisibilityList", targetVessel: "native-tunnel" });
assert.deepEqual(missionListPayload(), { action: "missionList", targetVessel: "native-tunnel", limit: 200 });

const lobby = source("../missionRooms/roomLobby.js");
const board = source("../missionRooms/workBoard.js");
const model = source("../missionRooms/workBoardModel.js");
const sources = source("../missionRooms/workBoardSources.js");
const view = source("../missionRooms/view.js");
const chat = source("../missionRooms/agentChat/model.js");

assert.match(lobby, /Promise\.allSettled/);
assert.match(lobby, /void refreshLegacy\(\)/);
assert.match(lobby, /missionListPayload\(\)/);
assert.match(board, /ALL WORK IN FLIGHT/);
assert.match(board, /stale activity/);
assert.match(board, /Mission history unavailable/);
assert.match(board, /\["all", "All"\]/);
assert.match(board, /\["orphaned", "Orphaned"\]/);
assert.match(model, /30 \* 60 \* 1000/);
assert.match(sources, /mission history/);
assert.match(view, /send direct messages at any time/);
assert.match(chat, /action:\s*"missionAgentMessage"/);
assert.match(chat, /requiresResponse:\s*true/);

for (const text of [lobby, board, model, sources, view]) {
	assert.doesNotMatch(text, /new\s+(?:WebSocket|EventSource)\s*\(/);
	assert.doesNotMatch(text, /missionRoomMessage|missionRoomUserMessage|websiteAgentMissionMessage/);
}

const now = Date.parse("2026-09-29T16:00:00.000Z");
const baseState = {
	missions: [{
		mission: { id: "m1", goal: "Live work", status: "active", updatedAt: "2026-09-29T15:59:30.000Z" },
		collaboration: { agents: [{ agentId: "agent-a" }] }
	}],
	visibilityMissions: [
		{ id: "plan-m1", missionId: "m1", title: "Plan mirror", status: "active", planningProgress: { completed: 2, required: 3 } },
		{ id: "plan-only", title: "Unlinked plan", status: "blocked" }
	],
	legacyMissionResult: { items: [
		{ id: "m1", title: "Historical duplicate", status: "running" },
		{ id: "m2", title: "Started earlier", status: "in-progress", updatedAt: "2026-09-29T15:58:00.000Z" },
		{ id: "m3", title: "Finished work", status: "completed" },
		{ id: "m4", title: "Old quiet work", status: "in-progress", updatedAt: "2026-09-29T14:00:00.000Z" }
	] }
};

const work = collectWork(baseState, now);
assert.equal(work.filter(item => item.missionId === "m1").length, 1);
const merged = work.find(item => item.missionId === "m1");
assert.equal(merged.hasRoom, true);
assert.deepEqual(new Set(merged.sources), new Set(["live room", "three-pass plan", "mission history"]));
assert.equal(merged.planning.completed, 2);
assert.equal(work.some(item => item.missionId === "m3"), false);
assert.equal(work.find(item => item.missionId === "m2")?.category, "orphaned");
assert.equal(work.find(item => item.missionId === "m4")?.stale, true);
assert.equal(work.find(item => item.identity === "visibility:plan-only")?.category, "needs attention");

const counts = boardCounts(baseState, now);
assert.equal(counts.total, 4);
assert.equal(counts["active now"], 1);
assert.equal(counts["needs attention"], 1);
assert.equal(counts.orphaned, 2);
assert.equal(collectWork({ ...baseState, workBoardFilter: "needs attention" }, now).length, 1);
assert.equal(legacyRows({ records: [{ id: "x" }] }).length, 1);

console.log("BHY Mission Rooms all-work visibility tests passed");

function source(relativePath) {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}
