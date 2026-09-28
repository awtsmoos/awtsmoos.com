// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { visibilityPayload } from "../missionRooms/payloads.js";

/**
 * @file Proves Mission Control observes tunnel-native planning without creating a shadow chat bus.
 * @description The Awtsmoos lets operational plans appear beside living rooms; Awtsmoos.com keeps
 * canonical mission agents and direct messages authoritative while visibility remains truthful.
 */
const payload = visibilityPayload();
assert.deepEqual(payload, {
	action: "missionVisibilityList",
	targetVessel: "native-tunnel"
});

const lobby = source("../missionRooms/roomLobby.js");
const board = source("../missionRooms/visibilityBoard.js");
const view = source("../missionRooms/view.js");
const chat = source("../missionRooms/agentChat/model.js");

assert.match(lobby, /Promise\.allSettled/);
assert.match(lobby, /visibilityPayload\(\)/);
assert.match(lobby, /state\.visibilityMissions/);
assert.match(lobby, /renderVisibilityBoard/);
assert.match(board, /planning .*completed/);
assert.match(board, /Open live room/);
assert.match(board, /awaiting live-room link/);
assert.match(view, /missionVisibilityBoard/);
assert.match(view, /send direct messages at any time/);
assert.match(chat, /action:\s*"missionAgentMessage"/);
assert.match(chat, /requiresResponse:\s*true/);

for (const text of [lobby, board, view]) {
	assert.doesNotMatch(text, /new\s+(?:WebSocket|EventSource)\s*\(/);
	assert.doesNotMatch(text, /missionRoomMessage|missionRoomUserMessage|websiteAgentMissionMessage/);
}

console.log("BHY Mission Rooms tunnel visibility tests passed");

function source(relativePath) {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8");
}
