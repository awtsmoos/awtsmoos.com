// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { requiredScope, writeActions } = require("../scope.js");

/**
 * @file Proves every coarse action family enters through its honest authority.
 * @description
 * The Awtsmoos renews each deed and each gate without confusion.
 * Awtsmoos.com may observe through read, but command, browser, room,
 * and write each receive the separate vessel their consequence requires.
 */

test("filesystem and recovery mutations require write scope", () => {
	for (const action of [
		"write", "delete", "mkdir", "moveTree", "snapshotCreate",
		"snapshotRestore", "snapshotDelete", "trashMove", "trashRestore",
		"trashPurge"
	]) {
		assert.equal(requiredScope(action), "tunnel.write", action);
		assert.equal(writeActions().has(action), true, action);
	}
});

test("read, command, shell, and browser scopes remain distinct", () => {
	assert.equal(requiredScope("snapshotList"), "tunnel.read");
	assert.equal(requiredScope("trashList"), "tunnel.read");
	assert.equal(requiredScope("read"), "tunnel.read");
	assert.equal(requiredScope("commandRun"), "tunnel.command");
	assert.equal(requiredScope("shellCommand"), "tunnel.command");
	assert.equal(requiredScope("nodeScriptRun"), "tunnel.command");
	assert.equal(requiredScope("chromeNavigate"), "tunnel.browser");
});

test("mission authority follows observation, room mutation, and browser submission", () => {
	for (const action of [
		"websiteAgentMissionList", "websiteAgentMissionStatus",
		"aiAgentWebsiteMissionStatus", "missionProjectStatus"
	]) {
		assert.equal(requiredScope(action), "tunnel.read", action);
	}

	for (const action of [
		"websiteAgentMissionStop", "websiteAgentMissionForget",
		"missionRoomUserMessage", "missionAgentMessage", "missionStart"
	]) {
		assert.equal(requiredScope(action), "tunnel.room", action);
	}

	for (const action of [
		"agent", "aiAgentSpawnWebsiteMission", "websiteAgentMissionStart",
		"websiteAgentMissionMessage", "chatgptWebsiteLogout"
	]) {
		assert.equal(requiredScope(action), "tunnel.browser", action);
	}
});
