// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/** Proves peer-sponsored fan-out never creates a recursive logical hierarchy. */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-flatland-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";

const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Spawning = require("../tools/fs/actionGroups/websiteAgents/spawning.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");

try {
	fs.mkdirSync(path.join(root, "api"), { recursive: true });
	const plan = Planner.plan({ root }, {
		agentCount: 3,
		maxTotalWebsiteAgents: 8,
		projectRoot: root
	});
	assert.equal(plan.subagentPolicy.topology, "flatland");
	assert.equal(plan.subagentPolicy.maxSubagentDepth, 1);
	const record = Store.create({
		id: `flatland-${process.pid}-${Date.now()}`,
		goal: "Prove bounded flat peers.",
		missionId: "room-flatland",
		plan
	});
	const rootAgent = record.agents[0];
	const first = Spawning.admit(record.id, rootAgent.id, [request("first")]);
	assert.equal(first.accepted.length, 1);
	const firstPeer = first.record.agents.find(agent =>
		agent.id === first.accepted[0].childAgentId
	);
	const second = Spawning.admit(record.id, firstPeer.id, [request("second")]);
	assert.equal(second.accepted.length, 1);
	const latest = second.record;
	const spawned = latest.agents.filter(agent => agent.isSpawnedAgent);
	assert.equal(spawned.length, 2);
	assert.ok(spawned.every(agent => agent.depth === 0));
	assert.ok(spawned.every(agent => agent.rootAgentId === agent.id));
	assert.ok(spawned.every(agent => agent.topology === "flat-peer"));
	assert.ok(spawned.every(agent => agent.id.startsWith("website_peer_")));
	assert.equal(firstPeer.sponsorAgentId, rootAgent.id);
	assert.equal(spawned[1].sponsorAgentId, firstPeer.id);
	console.log(JSON.stringify({
		ok: true,
		suite: "website-agent-flatland",
		logicalPeers: latest.agents.length,
		maximumDepth: Math.max(...latest.agents.map(agent => agent.depth)),
		physicalTabs: plan.physicalTabPolicy.maxActiveTabs,
		postCloseCooldownMs: plan.physicalTabPolicy.postCloseCooldownMs
	}));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function request(key) {
	return {
		key,
		role: "specialist",
		scope: "api",
		prompt: `Inspect ${key} without opening another physical tab.`
	};
}
