//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Discovery = require("../lib/instructions/projectInstructionDiscovery.js");
const Turns = require("../tools/fs/actionGroups/websiteAgents/prompt/turns.js");

/**
 * @file Proves agents receive deterministic root-to-subtree instruction layers for their exact scope.
 * @description
 * The Awtsmoos reveals broad covenant before local detail while unrelated sibling law stays outside;
 * Awtsmoos.com preserves hashes and provenance so every injected rule can be traced back to its file.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-project-instructions-"));
try {
	const targetDirectory = path.join(root, "geelooy", "apps", "tunnel");
	const siblingDirectory = path.join(root, "unrelated");
	fs.mkdirSync(targetDirectory, { recursive: true });
	fs.mkdirSync(siblingDirectory, { recursive: true });
	fs.writeFileSync(path.join(root, "AGENTS.md"), "ROOT RULE\n");
	fs.writeFileSync(path.join(targetDirectory, "agents.md"), "TUNNEL LOCAL RULE\n");
	fs.writeFileSync(path.join(siblingDirectory, "AGENTS.md"), "UNRELATED RULE\n");
	const target = path.join(targetDirectory, "worker.js");
	fs.writeFileSync(target, "// worker\n");
	const layers = Discovery.discover({
		projectRoot: root,
		paths: [target, path.join(root, "..", "outside.js")],
		includeProjectInstructionBodies: true
	});
	assert.deepEqual(layers.map(item => item.relativePath), [
		"AGENTS.md",
		"geelooy/apps/tunnel/agents.md"
	]);
	assert.deepEqual(layers.map(item => item.precedence), [1, 2]);
	assert.match(layers[0].body, /ROOT RULE/);
	assert.match(layers[1].body, /TUNNEL LOCAL RULE/);
	assert.equal(layers.some(item => String(item.body).includes("UNRELATED RULE")), false);
	assert.ok(layers.every(item => /^[0-9a-f]{64}$/.test(item.sha256)));

	const agent = {
		id: "agent-one", name: "Agent One", ordinal: 1, agentSessionId: "session-one",
		role: "coder", focus: "tunnel", scope: "geelooy/apps/tunnel", absoluteScope: targetDirectory
	};
	const record = { missionId: "mission-one", goal: "test instructions",
		plan: { projectRoot: root }, agents: [agent] };
	const prompt = Turns.firstTurn(record, agent, {
		agents: [], claims: [], turnInbox: { cursorBefore: 0, cursorAfter: 0, messages: [] }
	});
	assert.match(prompt, /ROOT RULE/);
	assert.match(prompt, /TUNNEL LOCAL RULE/);
	assert.doesNotMatch(prompt, /UNRELATED RULE/);

	console.log(JSON.stringify({
		ok: true,
		suite: "project-instruction-discovery",
		layers: layers.map(item => ({ relativePath: item.relativePath, precedence: item.precedence, sha256: item.sha256 }))
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}
