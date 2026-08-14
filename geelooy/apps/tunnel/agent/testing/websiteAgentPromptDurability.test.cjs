// B"H

const assert = require("node:assert/strict");
const Prompt = require("../tools/fs/actionGroups/websiteAgents/prompt.js");

const record = {
	missionId: "mission-one",
	goal: "durable shared-room agents",
	plan: { projectRoot: "/project", subagentPolicy: { maxSubagentsPerAgent: 3 } },
	agents: []
};
const agent = {
	id: "agent-one",
	name: "Agent One",
	ordinal: 1,
	agentSessionId: "session-one",
	scope: "src",
	role: "implementer",
	focus: "browser lifecycle"
};
const prompt = Prompt.firstTurn(record, agent, { agents: [], messages: [], activeClaims: [] });
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
assert.doesNotMatch(prompt, /SPAWN must be exactly|Return concise sections named/);
console.log(JSON.stringify({ ok: true, suite: "website-agent-prompt-durability" }));
