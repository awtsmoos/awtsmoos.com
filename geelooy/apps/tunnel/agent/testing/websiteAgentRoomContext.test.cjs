//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const M = require("../tools/fs/mission/index.js");
const C = require("../tools/fs/mission/collaboration.js");
const Briefing = require("../tools/fs/mission/assignment/briefing.js");
const PromptContext = require("../tools/fs/actionGroups/websiteAgents/prompt/context.js");
const RoomTurn = require("../tools/fs/actionGroups/websiteAgents/runner/roomTurnContext.js");
const delegateChildRoom = require("../tools/fs/actionGroups/websiteAgents/runner/delegateChildRoom.js");

/**
 * @file Proves live website agents share one recipient-aware sequenced room with durable delegation.
 * @description
 * The Awtsmoos lets A speak to B without leaking to C; Awtsmoos.com acknowledges once,
 * keeps replacement evidence, and lets a parent command a spawned child through the same room.
 */
const mission = {
	id: "mission-room-context",
	goal: "coordinate agents",
	status: "active",
	tasks: [],
	remainingWork: [],
	evidence: [],
	events: [],
	progressEvents: []
};
M.roomCreate(mission, { roomName: "Room Context", projectRoot: "/tmp/project" });
for (const id of ["agent-a", "agent-b", "agent-c"]) {
	M.roomJoin(mission, { agentId: id, name: id, role: "worker", spawnGroupId: "root" });
	C.join(mission, { agentId: id, agentName: id, role: "worker", projectRoot: "/tmp/project" });
}

M.roomMessage(mission, {
	agentId: "agent-a",
	fromAgent: "agent-a",
	toAgent: "agent-b",
	kind: "discovery",
	subject: "Peer finding",
	body: "Peer A found the exact durable secret.",
	requiresResponse: true
});
const agentB = { id: "agent-b", role: "tester", scope: "geelooy", logicalAgentId: "agent-b", spawnGroupId: "root" };
const first = RoomTurn.open(mission, agentB);
assert.equal(first.turnInbox.messages.some(item => item.body.includes("exact durable secret")), true);
assert.match(PromptContext.snapshot(first, agentB), /REPLY_REQUIRED/);
assert.match(PromptContext.snapshot(first, agentB), /exact durable secret/);
const second = M.roomInbox(mission, { agentId: "agent-b", acknowledge: true, limit: 100 });
assert.equal(second.messages.some(item => item.body.includes("exact durable secret")), false);
const agentC = M.roomInbox(mission, { agentId: "agent-c", acknowledge: false, limit: 100 });
assert.equal(agentC.messages.some(item => item.body.includes("exact durable secret")), false);
assert.equal(Briefing.findings(mission).messages.some(item => item.text.includes("exact durable secret")), true);

const child = {
	id: "child-one",
	name: "Child One",
	role: "specialist",
	focus: "Investigate isolated subsystem",
	scope: "geelooy/ai",
	assignmentPrompt: "Inspect geelooy/ai and report evidence. Spawn another specialist if independent work appears.",
	parentAgentId: "agent-b",
	sponsorAgentId: "agent-b",
	spawnGroupId: "spawn-group-one",
	generation: 2,
	claimMode: "write"
};
M.roomJoin(mission, { agentId: child.id, name: child.name, role: child.role,
	parentAgentId: child.parentAgentId, spawnGroupId: child.spawnGroupId, generation: child.generation });
C.join(mission, { agentId: child.id, agentName: child.name, role: child.role, projectRoot: "/tmp/project" });
const delegated = delegateChildRoom(mission, child);
const childInbox = M.roomInbox(mission, { agentId: child.id, acknowledge: false, limit: 100 });
assert.ok(delegated.delegationId);
assert.ok(delegated.claimId);
assert.ok(delegated.roomClaimId);
assert.equal(childInbox.messages.some(item => item.kind === "delegation" && item.requiresResponse), true);
assert.ok(childInbox.mustCallNext);
assert.equal(M.roomStatus(mission).claims.some(claim => claim.agentId === child.id), true);

console.log(JSON.stringify({
	ok: true,
	suite: "website-agent-room-context",
	firstUnread: first.turnInbox.unreadCount,
	delegationId: delegated.delegationId,
	roomClaimId: delegated.roomClaimId,
	childMustRespond: Boolean(childInbox.mustCallNext)
}, null, 2));
