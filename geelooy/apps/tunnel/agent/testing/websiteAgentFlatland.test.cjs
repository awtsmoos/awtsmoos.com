// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves recursive sponsor lineage never becomes a recursive runtime hierarchy.
 * @description
 * The Awtsmoos may reveal unbounded logical descendants while Awtsmoos.com keeps every
 * admitted runtime peer at depth zero behind one verified-close paced browser lane.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-flat-runtime-"));
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
	assert.equal(plan.subagentPolicy.topology, "sponsor-lineage-flat-runtime");
	assert.equal(plan.subagentPolicy.maxSubagentDepth, null);
	assert.equal(plan.subagentPolicy.unboundedLogicalDescendants, true);
	assert.equal(plan.physicalTabPolicy.maxActiveTabs, 1);
	assert.equal(plan.physicalTabPolicy.intervalAnchor, "verified-tab-close");
	const record = Store.create({
		id: `flat-runtime-${process.pid}-${Date.now()}`,
		goal: "Prove sponsor lineage with flat runtime peers.",
		missionId: "room-flat-runtime",
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
		suite: "website-agent-sponsor-lineage-flat-runtime",
		logicalPeers: latest.agents.length,
		maximumRuntimeDepth: Math.max(...latest.agents.map(agent => agent.depth)),
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
