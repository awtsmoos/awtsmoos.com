// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Proves sponsor lineage can continue without a logical descendant count ceiling.
 * @description
 * The Awtsmoos lets each useful peer sponsor another while Awtsmoos.com keeps physical
 * execution flat and single-tabbed, preserving lineage without a recursive browser tree.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-flatland-"));
process.env.AWTSMOOS_INSTALL_ROOT = path.join(root, "install");
process.env.AWTSMOOS_MISSION_JSON_BACKUP = "1";
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");
const Spawning = require("../tools/fs/actionGroups/websiteAgents/spawning.js");
const Store = require("../tools/fs/actionGroups/websiteAgents/store.js");

try {
	fs.mkdirSync(path.join(root, "api"), { recursive: true });
	const plan = Planner.plan({ root }, { agentCount: 3, projectRoot: root });
	assert.equal(plan.subagentPolicy.topology, "sponsor-lineage-flat-runtime");
	assert.equal(plan.subagentPolicy.maxSubagentDepth, null);
	assert.equal(plan.subagentPolicy.maxTotalWebsiteAgents, null);
	const record = Store.create({
		id: `flatland-${process.pid}-${Date.now()}`,
		goal: "Prove count-unbounded flat peers.",
		missionId: "room-flatland",
		plan
	});
	let sponsor = record.agents[0];
	for (const key of ["first", "second", "third", "fourth"]) {
		const admitted = Spawning.admit(record.id, sponsor.id, [request(key)]);
		assert.equal(admitted.accepted.length, 1);
		sponsor = admitted.record.agents.find(agent =>
			agent.id === admitted.accepted[0].childAgentId
		);
	}
	const latest = Store.read(record.id);
	const spawned = latest.agents.filter(agent => agent.isSpawnedAgent);
	assert.equal(spawned.length, 4);
	assert.ok(spawned.every(agent => agent.depth === 0));
	assert.ok(spawned.every(agent => agent.rootAgentId === agent.id));
	assert.ok(spawned.every(agent => agent.topology === "flat-peer"));
	assert.equal(plan.physicalTabPolicy.maxActiveTabs, 1);
	assert.equal(plan.physicalTabPolicy.postCloseCooldownMs, 24000);
	console.log(JSON.stringify({ ok: true, logicalPeers: latest.agents.length }));
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
