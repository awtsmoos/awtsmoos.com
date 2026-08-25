// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");

/**
 * @file Proves finite initial seeding never becomes a total logical descendant ceiling.
 * @description
 * The Awtsmoos may reveal descendants without count limit while Awtsmoos.com materializes
 * a practical first cohort and keeps one physical tab behind verified close plus 24 seconds.
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
	assert.equal(ordinary.startSpacingMs, 24000);
	assert.equal(ordinary.subagentPolicy.subagentStartSpacingMs, 24000);
	assert.deepEqual(ordinary.physicalTabPolicy, {
		maxActiveTabs: 1,
		intervalAnchor: "accepted-submission-verified-tab-close",
		postCloseCooldownMs: 24000
	});
	assert.equal(ordinary.subagentPolicy.unboundedLogicalDescendants, true);
	assert.equal(ordinary.subagentPolicy.logicalAgentLimit, null);
	assert.equal(ordinary.subagentPolicy.maxTotalWebsiteAgents, null);
	assert.equal(ordinary.subagentPolicy.maxSubagentDepth, null);
	assert.equal(ordinary.subagentPolicy.maxSubagentsPerAgent, null);

	const hundred = Planner.plan({ root }, {
		prompt: "Queue one hundred independent initial agents safely.",
		agentCount: 100,
		startSpacingMs: 1,
		subagentStartSpacingMs: 1,
		projectRoot: root
	});
	assert.equal(hundred.agentCount, 100);
	assert.equal(hundred.agents.length, 100);
	assert.equal(new Set(hundred.agents.map(agent => agent.id)).size, 100);
	assert.equal(hundred.startSpacingMs, 24000);
	assert.equal(hundred.subagentPolicy.subagentStartSpacingMs, 24000);
	assert.equal(hundred.subagentPolicy.descendantAdmission, "count-unbounded-pressure-paced");

	const maximumSeed = Planner.plan({ root }, {
		prompt: "Materialize the maximum initial cohort.",
		agentCount: 999,
		projectRoot: root
	});
	assert.equal(maximumSeed.agentCount, 512);
	assert.equal(maximumSeed.initialSeedAgentLimit, 512);
	assert.equal(maximumSeed.subagentPolicy.logicalAgentLimit, null);

	const target = Planner.plan({ root }, {
		prompt: "Inspect configured target.",
		projectRoot: root,
		agentStartUrl: `${Planner.AWTSMOOS_SHLIACH_URL}/c/private?temporary=1`
	});
	assert.equal(target.agentStartUrl, Planner.AWTSMOOS_SHLIACH_URL);
	assert.throws(() => Planner.plan({ root }, {
		prompt: "Reject another custom GPT.",
		projectRoot: root,
		agentStartUrl: "https://example.com/g/not-chatgpt"
	}), /invalid_chatgpt_custom_gpt_url/);

	console.log(JSON.stringify({
		ok: true,
		initialSeedLimit: maximumSeed.initialSeedAgentLimit,
		unboundedLogicalDescendants: maximumSeed.subagentPolicy.unboundedLogicalDescendants,
		postCloseCooldownMs: maximumSeed.physicalTabPolicy.postCloseCooldownMs
	}));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
