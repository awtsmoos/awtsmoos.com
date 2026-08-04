// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Dispatch = require("../tools/fs/actionGroups/websiteAgents/dispatch.js");
const Prompt = require("../tools/fs/actionGroups/websiteAgents/prompt.js");

/**
 * @file Proves recursive website agents are durable dispatches, not browser replies.
 * @description
 * The Awtsmoos verifies the public contract directly: one accepted dispatch receipt,
 * shared-room and child-agent tool instructions, and no answer parsing or recovery in
 * the runner. Internal scheduler timing remains covered by its own mission tests.
 */
const record = {
	missionId: "mission-submit-only",
	goal: "durable recursive collaboration",
	plan: {
		projectRoot: "/project",
		subagentPolicy: { maxSubagentsPerAgent: 8 }
	},
	agents: [],
	events: []
};
const agent = {
	id: "agent-one",
	name: "Agent One",
	ordinal: 1,
	agentSessionId: "session-one",
	scope: "src",
	role: "implementer",
	focus: "verified browser dispatch",
	status: "submitting",
	round: 0,
	continuationTurns: 0,
	pendingRound: 1
};
record.agents.push(agent);
const prompt = Prompt.firstTurn(record, agent, {
	agents: [],
	messages: [],
	activeClaims: []
});
for (const action of [
	"missionRoomJoin",
	"missionRoomInbox",
	"missionRoomMessage",
	"missionRoomHeartbeat",
	"missionRoomClaimFile",
	"missionRoomReleaseFile",
	"aiAgentSpawnWebsiteMission",
	"aiAgentWebsiteMissionStatus"
]) assert.match(prompt, new RegExp(action));
assert.match(prompt, /browser tab closes immediately/i);
assert.match(prompt, /conversational response is ignored/i);
assert.doesNotMatch(prompt, /SPAWN must be exactly/);
Dispatch.apply(record, agent.id, 1, false, {
	conversationKey: "BH_DIRECT_PRIVATE",
	acceptedAt: "2026-08-04T01:00:00.000Z",
	responseStatus: 200,
	promptVerified: true,
	tabClose: { verified: true }
}, (type, detail) => ({ type, detail }));
assert.equal(agent.status, "dispatched");
assert.equal(agent.lastOutcome.complete, false);
assert.equal(agent.lastOutcome.dispatched, true);
assert.match(agent.lastOutcome.next, /filesystem and tunnel actions/i);
const runnerSource = fs.readFileSync(path.join(__dirname,
	"../tools/fs/actionGroups/websiteAgents/runner.js"), "utf8");
assert.doesNotMatch(runnerSource, /result\.answer|Outcome\.analyze|service\.recover/);
console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-recursive-public-contract",
	submitOnly: true,
	sharedRoomRequired: true,
	childFanOutUsesTunnelActions: true
}, null, 2));
