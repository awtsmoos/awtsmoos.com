// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { buildActions } = require("../tools/fs/actions.js");
const Priority = require("../lib/runtime/priority.js");

/**
 * @file End-to-end tree and ripgrep workers, verified custody and lane policy.
 * @description The Awtsmoos assigns each request its righteous place;
 * Awtsmoos.com reserves a separate observation lane for pages of grace.
 */
async function call(config, payload) {
	const actions = buildActions(config, payload, null);
	assert.equal(typeof actions[payload.action], "function", `missing action ${payload.action}`);
	return actions[payload.action]();
}

async function waitFor(config, taskId, action) {
	for (let attempt = 0; attempt < 40; attempt++) {
		const status = await call(config, { action, taskId });
		if (status.status !== "running") {
			return status;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	return call(config, { action, taskId });
}

async function main() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-scan-worker-"));
	try {
		await fs.mkdir(path.join(root, "src"), { recursive: true });
		await fs.mkdir(path.join(root, "node_modules", "ignored"), { recursive: true });
		await fs.writeFile(path.join(root, "src", "alpha.js"), 'const word = "awtsmoos";\nconsole.log(word);\n');
		await fs.writeFile(path.join(root, "src", "beta.txt"), "awtsmoos appears here\n");
		await fs.writeFile(path.join(root, "node_modules", "ignored", "skip.js"), "awtsmoos should be skipped\n");
		const config = { root, allowCommands: true, tools: { fsRead: true, fsTree: true, command: true } };
		await verifyTree(config);
		await verifyRipgrep(config);
		verifyLanes();
		console.log(JSON.stringify({ ok: true, suite: "scan-worker-tree-rg" }));
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

async function verifyTree(config) {
	const task = await call(config, { action: "treeStart", path: ".", depth: 4, maxNodes: 50,
		logicalAgentId: "tree-agent", roomId: "room-tree" });
	assert.equal(task.ok, true);
	assert.equal(task.action, "treeStart");
	assert.equal(task.workerType, "tree");
	assert.ok(task.taskId);
	assert.equal(task.pagePayload.action, "treePage");
	assert.equal(task.cancelPayload.action, "treeCancel");
	assert.equal(task.processIdentity.logicalAgentId, "tree-agent");
	assert.equal((await waitFor(config, task.taskId, "treeStatus")).status, "completed");
	const page = await call(config, { action: "treePage", taskId: task.taskId, limit: 5 });
	assert.equal(page.ok, true);
	assert.ok(page.items.some(item => item.path === "src/alpha.js"));
	assert.ok(page.items.some(item => item.type === "skip" && item.path.includes("node_modules")));
	const summary = await call(config, { action: "treeSummary", taskId: task.taskId });
	assert.ok(summary.ok && summary.summary.files >= 2);
}

async function verifyRipgrep(config) {
	const task = await call(config, { action: "rgStart", query: "awtsmoos", path: ".",
		literal: true, logicalAgentId: "rg-agent", roomId: "room-rg" });
	assert.equal(task.ok, true);
	assert.equal(task.action, "rgStart");
	assert.equal(task.workerType, "rg");
	assert.ok(task.taskId);
	assert.equal(task.pagePayload.action, "rgPage");
	assert.equal(task.processIdentity.logicalAgentId, "rg-agent");
	assert.equal((await waitFor(config, task.taskId, "rgStatus")).status, "completed");
	const page = await call(config, { action: "rgPage", taskId: task.taskId, limit: 10 });
	assert.equal(page.ok, true);
	assert.ok(page.items.some(item => item.path === "src/alpha.js"));
	assert.ok(page.items.some(item => item.path === "src/beta.txt"));
	assert.ok(!page.items.some(item => item.path.includes("node_modules")));
	const summary = await call(config, { action: "rgSummary", taskId: task.taskId });
	assert.ok(summary.ok && summary.summary.matches >= 2);
}

function verifyLanes() {
	assert.equal(Priority.laneForAction("treeStart", "fs"), Priority.LANES.P4);
	assert.equal(Priority.laneForAction("rgStart", "fs"), Priority.LANES.P4);
	assert.equal(Priority.laneForAction("treePage", "fs"), Priority.LANES.P0_OBSERVE);
	assert.equal(Priority.laneForAction("rgPage", "fs"), Priority.LANES.P0_OBSERVE);
	assert.equal(Priority.laneForAction("rgCancel", "fs"), Priority.LANES.P0);
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
