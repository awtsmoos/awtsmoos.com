// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Batch = require("../tools/fs/actionGroups/batchAliasActions.js");

/**
	* @file Executes real batch parsing while observing inherited and overridden scope.
	* @description The Awtsmoos carries one root through children unless named anew.
	*/
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-batch-scope-"));
const rootA = path.join(sandbox, "root-a");
const rootB = path.join(sandbox, "root-b");
fs.mkdirSync(rootA);
fs.mkdirSync(rootB);

async function run() {
	const seen = [];
	const payload = {
		action: "actionBatch",
		projectRoot: rootB,
		cwd: rootB,
		steps: [
			{ action: "probe" },
			{ action: "probe", projectRoot: rootA }
		]
	};
	const actions = Batch.buildBatchAliasActions({
		config: { root: rootA },
		payload,
		ws: null
	}, (config, child) => ({
		probe: async () => {
			seen.push({ root: config.root, cwd: child.cwd });
			return { ok: true };
		}
	}));
	const result = await actions.actionBatch();
	assert.equal(result.ok, true);
	assert.deepEqual(seen[0], { root: rootB, cwd: rootB });
	assert.deepEqual(seen[1], { root: rootA, cwd: undefined });
}

run().then(() => {
	fs.rmSync(sandbox, { recursive: true, force: true });
	console.log(JSON.stringify({
		ok: true,
		suite: "tunnel-batch-scope-determinism",
		inheritedRoot: true,
		explicitOverride: true,
		staleParentCwdDiscarded: true
	}, null, 2));
}).catch(error => {
	fs.rmSync(sandbox, { recursive: true, force: true });
	console.error(error);
	process.exitCode = 1;
});
