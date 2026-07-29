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
	assert.equal(big.agentCount, 12);
	assert.equal(big.startSpacingMs, 12000);
	assert.equal(big.collaborationRounds, 2);
	assert.equal(new Set(big.agents.map(agent => agent.id)).size, 12);
	assert.ok(big.agents.every(agent => agent.scope && agent.focus));

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
		minimumAgents: minimum.agentCount,
		sequentialSpacingMs: big.startSpacingMs
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
