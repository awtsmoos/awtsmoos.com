// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Planner = require("../tools/fs/actionGroups/websiteAgents/planner.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-web-plan-"));
try {
	for (const name of ["api", "frontend", "runtime", "tests"]) {
		fs.mkdirSync(path.join(root, name));
	}
	const big = Planner.plan({ root }, {
		prompt: "Fully improve the entire large repository with many agents.",
		projectRoot: root
	});
	assert.equal(big.agentCount, 32);
	assert.equal(big.startSpacingMs, 12000);
	assert.equal(big.collaborationRounds, 2);
	assert.equal(big.agentStartUrl, Planner.AWTSMOOS_SHLIACH_URL);
	assert.equal(big.customGptName, Planner.AWTSMOOS_SHLIACH_NAME);
	assert.equal(new Set(big.agents.map(agent => agent.id)).size, 32);
	assert.ok(big.agents.every(agent => agent.scope && agent.focus));
	assert.equal(big.subagentPolicy.mode, "bounded-single-use");
	assert.equal(big.subagentPolicy.allowRecursiveSubagents, true);
	assert.equal(big.subagentPolicy.maxSubagentDepth, 4);
	assert.equal(big.subagentPolicy.maxSubagentsPerAgent, 32);
	assert.equal(big.subagentPolicy.maxTotalWebsiteAgents, 256);
	assert.equal(big.subagentPolicy.subagentStartSpacingMs, 12000);
	assert.deepEqual(big.subagentPolicy.roomUpdates, [
		"plan", "progress", "handoff", "completion"
	]);

	const translation = Planner.plan({ root }, {
		prompt: "Translate and verify all 4,000 pages with durable context and exact handoffs.",
		projectRoot: root
	});
	assert.equal(translation.fanOutTier, "enormous");
	assert.equal(translation.agentCount, 64);
	assert.equal(translation.subagentPolicy.priority, "required-when-available");

	const software = Planner.plan({ root }, {
		prompt: "Build and verify an entire enterprise software platform across frontend, backend, runtime, security, and tests.",
		projectRoot: root
	});
	assert.equal(software.fanOutTier, "large");
	assert.equal(software.agentCount, 32);

	const hugeSoftware = Planner.plan({ root }, {
		prompt: "Build a huge software system with dozens of agents.",
		projectRoot: root
	});
	assert.equal(hugeSoftware.fanOutTier, "enormous");
	assert.equal(hugeSoftware.agentCount, 64);

	const medium = Planner.plan({ root }, {
		prompt: "Handle multiple coordinated areas with separate verification.",
		projectRoot: root
	});
	assert.equal(medium.fanOutTier, "medium");
	assert.equal(medium.agentCount, 16);

	const small = Planner.plan({ root }, {
		prompt: "Inspect one focused issue.",
		projectRoot: root
	});
	assert.equal(small.fanOutTier, "small");
	assert.equal(small.agentCount, 8);

	const explicitMaximum = Planner.plan({ root }, {
		prompt: "Use the requested bounded team.",
		agentCount: 200,
		projectRoot: root
	});
	assert.equal(explicitMaximum.agentCount, 96);
	assert.equal(explicitMaximum.subagentPolicy.maxTotalWebsiteAgents, 256);

	const recursiveMaximums = Planner.plan({ root }, {
		prompt: "Use a deeply bounded recursive team.",
		agentCount: 3,
		maxSubagentsPerAgent: 999,
		maxTotalWebsiteAgents: 999,
		maxSubagentDepth: 99,
		subagentStartSpacingMs: 1,
		projectRoot: root
	});
	assert.equal(recursiveMaximums.subagentPolicy.maxSubagentsPerAgent, 96);
	assert.equal(recursiveMaximums.subagentPolicy.maxTotalWebsiteAgents, 512);
	assert.equal(recursiveMaximums.subagentPolicy.maxSubagentDepth, 8);
	assert.equal(recursiveMaximums.subagentPolicy.subagentStartSpacingMs, 10000);

	const continuedTarget = Planner.plan({ root }, {
		prompt: "Inspect the configured custom GPT target.",
		projectRoot: root,
		agentStartUrl: `${Planner.AWTSMOOS_SHLIACH_URL}/c/private?temporary=1`
	});
	assert.equal(continuedTarget.agentStartUrl, Planner.AWTSMOOS_SHLIACH_URL);
	assert.equal(continuedTarget.customGptName, Planner.AWTSMOOS_SHLIACH_NAME);
	assert.throws(() => Planner.plan({ root }, {
		prompt: "Reject another custom GPT.",
		projectRoot: root,
		agentStartUrl: "https://chatgpt.com/g/g-test-specialist"
	}), /invalid_chatgpt_custom_gpt_url/);
	assert.throws(() => Planner.plan({ root }, {
		prompt: "Reject an external target.",
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
		bigPromptAgents: big.agentCount,
		highFanOutAgents: translation.agentCount,
		minimumAgents: minimum.agentCount,
		sequentialSpacingMs: big.startSpacingMs
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
