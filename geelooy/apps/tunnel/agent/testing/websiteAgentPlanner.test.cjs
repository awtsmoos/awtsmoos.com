// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");

/**
 * @file Proves large logical swarms remain bounded at admission and physically serialized.
 * @description
 * The Awtsmoos may reveal hundreds of logical shluchim while Awtsmoos.com keeps one
 * browser vessel, a twenty-second start floor, and an eighteen-second verified-close rest.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-plan-"));

try {
	for (const name of ["api", "frontend", "runtime", "tests"]) {
		fs.mkdirSync(path.join(root, name));
	}
	const ordinary = Planner.plan({ root }, {
		prompt: "Fully improve the entire large repository with many agents.",
		projectRoot: root
	});
	assert.equal(ordinary.agentCount, 32);
	assert.equal(ordinary.startSpacingMs, 20000);
	assert.equal(ordinary.subagentPolicy.subagentStartSpacingMs, 20000);
	assert.deepEqual(ordinary.physicalTabPolicy, {
		maxActiveTabs: 1,
		intervalAnchor: "verified-tab-close",
		postCloseCooldownMs: 18000
	});
	assert.equal(new Set(ordinary.agents.map(agent => agent.id)).size, 32);
	assert.equal(ordinary.subagentPolicy.allowRecursiveSubagents, true);
	assert.equal(ordinary.subagentPolicy.unboundedLogicalDescendants, true);
	assert.equal(ordinary.subagentPolicy.logicalAgentLimit, null);
	assert.equal(ordinary.subagentPolicy.maxSubagentDepth, null);

	const hundred = Planner.plan({ root }, {
		prompt: "Queue one hundred independent agents safely.",
		agentCount: 100,
		startSpacingMs: 1,
		subagentStartSpacingMs: 1,
		projectRoot: root
	});
	assert.equal(hundred.agentCount, 100);
	assert.equal(hundred.agents.length, 100);
	assert.equal(new Set(hundred.agents.map(agent => agent.id)).size, 100);
	assert.equal(hundred.agents[0].id, "website_001_architect");
	assert.equal(hundred.startSpacingMs, 20000);
	assert.equal(hundred.subagentPolicy.subagentStartSpacingMs, 20000);
	assert.equal(hundred.physicalTabPolicy.maxActiveTabs, 1);
	assert.equal(hundred.subagentPolicy.logicalAgentLimit, null);

	const maximum = Planner.plan({ root }, {
		prompt: "Queue the maximum admitted initial swarm.",
		agentCount: 999,
		projectRoot: root
	});
	assert.equal(maximum.agentCount, 512);
	assert.equal(maximum.agents.length, 512);
	assert.equal(maximum.subagentPolicy.unboundedLogicalDescendants, true);

	const target = Planner.plan({ root }, {
		prompt: "Inspect the configured custom GPT target.",
		projectRoot: root,
		agentStartUrl: `${Planner.AWTSMOOS_SHLIACH_URL}/c/private?temporary=1`
	});
	assert.equal(target.agentStartUrl, Planner.AWTSMOOS_SHLIACH_URL);
	assert.throws(() => Planner.plan({ root }, {
		prompt: "Reject another custom GPT.",
		projectRoot: root,
		agentStartUrl: "https://example.com/g/not-chatgpt"
	}), /invalid_chatgpt_custom_gpt_url/);

	const minimum = Planner.plan({ root }, {
		prompt: "Inspect one thing.",
		agentCount: 1,
		scopes: ["api", "../outside"]
	});
	assert.equal(minimum.agentCount, 3);
	assert.ok(minimum.agents.every(agent => agent.scope !== "../outside"));

	console.log(JSON.stringify({
		ok: true,
		suite: "website-agent-planner",
		queuedAgents: hundred.agentCount,
		maximumInitialAgents: maximum.agentCount,
		maxActiveTabs: hundred.physicalTabPolicy.maxActiveTabs,
		startSpacingMs: hundred.startSpacingMs,
		postCloseCooldownMs: hundred.physicalTabPolicy.postCloseCooldownMs
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
