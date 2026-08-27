// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves successor lineage survives real website peer admission into a fresh conversation.
 * @description
 * The Awtsmoos lets a new messenger inherit responsibility without inheriting an old browser;
 * Awtsmoos.com persists generation, predecessor, sibling group, and project-relative handoff
 * while conversation identity remains empty until the first new-chat website turn is created.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-terminal-lineage-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Spawning = require("../tools/fs/actionGroups/websiteAgents/spawning.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");

try {
	fs.mkdirSync(path.join(root, "api"), { recursive: true });
	const plan = Planner.plan({ root }, { agentCount: 1, projectRoot: root });
	const record = Store.create({
		id: `terminal-lineage-${process.pid}-${Date.now()}`,
		goal: "Carry one terminal successor into a fresh conversation.",
		missionId: "mission-terminal-lineage",
		plan
	});
	const sponsor = record.agents[0];
	Store.update(record.id, (current) => {
		const predecessor = current.agents.find((agent) => agent.id === sponsor.id);
		predecessor.generation = 4;
		predecessor.spawnGroupId = "generation-family-one";
		return current;
	});
	const admitted = Spawning.admit(record.id, sponsor.id, [{
		key: "terminal-lineage-key",
		role: "successor",
		scope: "api",
		prompt: "Continue the same unfinished mission in a fresh chat.",
		generation: 5,
		spawnGroupId: "generation-family-one",
		predecessorAgentId: sponsor.id,
		handoffPaths: ["project:handoff/next.md"]
	}]);
	assert.equal(admitted.accepted.length, 1);
	const childId = admitted.accepted[0].childAgentId;
	const child = Store.read(record.id).agents.find((agent) => agent.id === childId);
	assert.ok(child);
	assert.equal(child.generation, 5);
	assert.equal(child.predecessorAgentId, sponsor.id);
	assert.equal(child.spawnGroupId, "generation-family-one");
	assert.deepEqual(child.handoffPaths, ["project:handoff/next.md"]);
	assert.equal(child.conversationKey, null);
	assert.equal(child.isSpawnedAgent, true);
	assert.equal(child.depth, 0);
	assert.equal(child.assignmentPrompt, "Continue the same unfinished mission in a fresh chat.");
	console.log(JSON.stringify({ ok: true, suite: "terminal-successor-spawn-lineage" }));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
