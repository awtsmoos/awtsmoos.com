// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { requiredScope, writeActions } = require("../scope.js");

/**
 * @file Proves every public action family enters through its honest authority.
 * @description
 * The Awtsmoos renews observation, coordination, room mutation, and execution.
 * Awtsmoos.com keeps their gates distinct so sub-agents can live without asking
 * for broader authority than the exact deed they are created to perform.
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

test("read, command, and browser scopes remain distinct", () => {
	assert.equal(requiredScope("snapshotList"), "tunnel.read");
	assert.equal(requiredScope("read"), "tunnel.read");
	assert.equal(requiredScope("commandRun"), "tunnel.command");
	assert.equal(requiredScope("shellCommand"), "tunnel.command");
	assert.equal(requiredScope("chromeNavigate"), "tunnel.browser");
});

test("mission observation requires only read authority", () => {
	for (const action of [
		"missionDaemonStatus", "missionDeadmanStatus", "missionGet",
		"missionList", "missionProjectStatus", "missionRoomLiveStatus",
		"missionRoomStatus", "missionTimeline", "missionWatchdogStatus"
	]) {
		assert.equal(requiredScope(action), "tunnel.read", action);
	}
});

test("delegated-agent coordination requires mission authority", () => {
	for (const action of [
		"missionAgentAudit", "missionAgentClaim", "missionAgentHeartbeat",
		"missionAgentMessage", "missionAgentSync", "missionDaemonRecover",
		"missionDaemonStart", "missionDaemonTick", "missionLeaseRenew",
		"missionLoopPulse", "missionQueueAdd", "missionStepExecute",
		"missionWatchdogTick"
	]) {
		assert.equal(requiredScope(action), "tunnel.mission", action);
	}
});

test("shared-room mutation retains room authority", () => {
	for (const action of [
		"missionRoomCreate", "missionRoomInviteAgent",
		"missionRoomSettings", "missionRoomUserMessage", "missionStart",
		"websiteAgentMissionForget", "websiteAgentMissionStop"
	]) {
		assert.equal(requiredScope(action), "tunnel.room", action);
	}
});

test("website mission browser submission remains browser authority", () => {
	for (const action of [
		"agent", "aiAgentSpawnWebsiteMission", "websiteAgentMissionStart",
		"websiteAgentMissionMessage", "chatgptWebsiteLogout"
	]) {
		assert.equal(requiredScope(action), "tunnel.browser", action);
	}
});
