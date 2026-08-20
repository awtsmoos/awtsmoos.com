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
 * @file Proves canonical root authority is immutable while cwd stays useful beneath it.
 * @description
 * The Awtsmoos gives a request one enduring ground. Awtsmoos.com lets descendants
 * walk through directories inside that ground, while filesystem aliases resolve to
 * one real vessel and alternate project roots can never widen execution authority.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-scope-"));
const rootA = path.join(sandbox, "root-a");
const rootB = path.join(sandbox, "root-b");
const nested = path.join(rootA, "nested");
fs.mkdirSync(nested, { recursive: true });
fs.mkdirSync(rootB);

const canonicalRootA = fs.realpathSync.native(rootA);
const canonicalNested = fs.realpathSync.native(nested);

try {
	const config = { root: canonicalRootA };
	assert.equal(Scope.selectedRoot(config, {}), canonicalRootA);
	assert.equal(Scope.selectedRoot(config, { projectRoot: rootA }), canonicalRootA);
	assert.equal(Scope.selectedRoot(config, { scopeRoot: rootA }), canonicalRootA);
	assert.throws(
		() => Scope.selectedRoot(config, { projectRoot: rootB }),
		error => error.code === "immutable_root_violation"
	);
	assert.throws(
		() => Scope.selectedRoot(config, { scopeRoot: sandbox }),
		error => error.code === "immutable_root_violation"
	);

	assert.equal(Context.resolveCwd(config, { cwd: nested }), canonicalNested);
	assert.throws(
		() => Context.resolveCwd(config, { cwd: rootB }),
		error => error.code === "path_outside_project_root"
	);

	const inherited = Scope.childPayload(
		{ projectRoot: canonicalRootA, cwd: canonicalNested },
		{ action: "read" }
	);
	assert.equal(inherited.projectRoot, canonicalRootA);
	assert.equal(inherited.cwd, canonicalNested);
	assert.throws(
		() => Scope.childPayload(
			{ projectRoot: canonicalRootA, cwd: canonicalNested },
			{ action: "read", projectRoot: rootB }
		),
		error => error.code === "immutable_root_violation"
	);

	const first = Replay.fingerprint({
		action: "read",
		projectRoot: canonicalRootA,
		cwd: canonicalRootA,
		p: "x"
	});
	const second = Replay.fingerprint({
		action: "read",
		projectRoot: canonicalRootA,
		cwd: canonicalNested,
		p: "x"
	});
	assert.notEqual(first, second);

	const receipt = Receipts.created({
		receiptId: "receipt_scope",
		jobId: "job_scope",
		workerId: "worker_scope",
		requestAction: "commandRun",
		executionAction: "commandStart",
		projectRoot: canonicalRootA,
		cwd: canonicalNested
	});
	assert.equal(receipt.projectRoot, canonicalRootA);
	assert.equal(receipt.cwd, canonicalNested);
	assert.equal(receipt.executionAction, "commandStart");
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "tunnel-request-scope-determinism",
	canonicalRoot: true,
	immutableRoot: true,
	strictCwd: true,
	childInheritance: true,
	replayScopeBound: true
}, null, 2));
