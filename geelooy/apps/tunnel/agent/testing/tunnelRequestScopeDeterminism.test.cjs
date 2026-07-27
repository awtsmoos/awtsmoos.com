// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Scope = require("../lib/runtime/request-scope.js");
const Context = require("../tools/fs/commandJob/context.js");
const Replay = require("../tools/fs/actionReplayIdentity.js");
const Receipts = require("../lib/workers/worker-receipts.js");

/**
	* @file Proves roots and cwd are immutable, strict, and replay-significant.
	* @description The Awtsmoos refuses silent fallback into another repository.
	*/
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-scope-"));
const rootA = path.join(sandbox, "root-a");
const rootB = path.join(sandbox, "root-b");
fs.mkdirSync(rootA);
fs.mkdirSync(rootB);

try {
	const config = { root: rootA };
	assert.equal(Scope.selectedRoot(config, { projectRoot: rootB }), rootB);
	assert.throws(
		() => Scope.selectedRoot(config, { projectRoot: "relative-root" }),
		error => error.code === "project_root_must_be_absolute"
	);
	assert.throws(
		() => Scope.selectedRoot(config, { projectRoot: path.join(sandbox, "missing") }),
		error => error.code === "project_root_not_found"
	);
	assert.equal(Context.resolveCwd(config, { cwd: rootA }), rootA);
	assert.throws(
		() => Context.resolveCwd(config, { cwd: rootB }),
		error => error.code === "path_outside_project_root"
	);

	const inherited = Scope.childPayload({ projectRoot: rootA, cwd: rootA }, { action: "read" });
	assert.equal(inherited.projectRoot, rootA);
	assert.equal(inherited.cwd, rootA);
	const overridden = Scope.childPayload(
		{ projectRoot: rootA, cwd: rootA },
		{ action: "read", projectRoot: rootB }
	);
	assert.equal(overridden.projectRoot, rootB);
	assert.equal(overridden.cwd, undefined);

	const first = Replay.fingerprint({ action: "read", projectRoot: rootA, cwd: rootA, p: "x" });
	const second = Replay.fingerprint({ action: "read", projectRoot: rootB, cwd: rootB, p: "x" });
	assert.notEqual(first, second);

	const receipt = Receipts.created({
		receiptId: "receipt_scope",
		jobId: "job_scope",
		workerId: "worker_scope",
		requestAction: "commandRun",
		executionAction: "commandStart",
		projectRoot: rootB,
		cwd: rootB
	});
	assert.equal(receipt.projectRoot, rootB);
	assert.equal(receipt.cwd, rootB);
	assert.equal(receipt.executionAction, "commandStart");
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-request-scope-determinism",
	strictCwd: true,
	batchInheritance: true,
	replayScopeBound: true,
	receiptScopeBound: true
}, null, 2));
