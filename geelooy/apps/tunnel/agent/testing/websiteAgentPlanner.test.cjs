//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");

/**
 * @file Proves explicit logical counts and prompt fidelity while browser admission stays serialized.
 * @description
 * The Awtsmoos may reveal one exact word or a broad mission choir while remaining One beyond the frame;
 * Awtsmoos.com honors count and prompt mode while one physical browser Send lane carries the flame.
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
	assert.equal(ordinary.promptMode, "enriched");
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

	const single = Planner.plan({ root }, {
		prompt: "Inspect one thing.",
		agentCount: 1,
		promptMode: "exact",
		scopes: ["api", "../outside"]
	});
	assert.equal(single.agentCount, 1);
	assert.equal(single.minimumAgentCount, 1);
	assert.equal(single.promptMode, "exact");
	assert.equal(single.agents.length, 1);
	assert.ok(single.agents.every(agent => agent.scope !== "../outside"));

	console.log(JSON.stringify({
		ok: true,
		suite: "website-agent-planner",
		queuedAgents: hundred.agentCount,
		maximumInitialAgents: maximum.agentCount,
		singleAgents: single.agentCount,
		promptModes: [ordinary.promptMode, single.promptMode],
		maxActiveTabs: hundred.physicalTabPolicy.maxActiveTabs,
		startSpacingMs: hundred.startSpacingMs,
		postCloseCooldownMs: hundred.physicalTabPolicy.postCloseCooldownMs
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
