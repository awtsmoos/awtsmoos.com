// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Ops = require("../tools/fs/fileOpsMoveDelete.js");

/**
 * @file Proves simulation can never masquerade as destructive execution.
 * @description
 * The Awtsmoos reveals intention and mutation as different worlds; Awtsmoos.com
 * requires dryRun false plus explicit confirmation before bytes disappear.
 */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-delete-proof-"));
	const config = { root, allowWrite: true, tools: { fsWrite: true } };
	try {
		const file = path.join(root, "proof.txt");
		fs.writeFileSync(file, "B\"H");
		const simulated = await Ops.deleteFile(config, { path: "proof.txt" });
		assert.equal(simulated.executionState, "simulated");
		assert.equal(simulated.mutationApplied, false);
		assert.equal(simulated.deleted, false);
		assert.equal(fs.existsSync(file), true);
		const refused = await Ops.deleteFile(config, {
			path: "proof.txt",
			dryRun: false
		});
		assert.equal(refused.ok, false);
		assert.equal(refused.error, "confirm_required");
		assert.equal(fs.existsSync(file), true);
		const executed = await Ops.deleteFile(config, {
			path: "proof.txt",
			dryRun: false,
			confirm: true
		});
		assert.equal(executed.executionState, "executed");
		assert.equal(executed.mutationApplied, true);
		assert.equal(executed.deleted, true);
		assert.equal(fs.existsSync(file), false);
		const tree = path.join(root, "tree");
		fs.mkdirSync(tree);
		fs.writeFileSync(path.join(tree, "child.txt"), "child");
		const treeSimulated = await Ops.deleteTree(config, { path: "tree" });
		assert.equal(treeSimulated.executionState, "simulated");
		assert.equal(fs.existsSync(tree), true);
		const treeExecuted = await Ops.deleteTree(config, {
			path: "tree",
			dryRun: false,
			confirm: true
		});
		assert.equal(treeExecuted.executionState, "executed");
		assert.equal(fs.existsSync(tree), false);
		console.log(JSON.stringify({
			ok: true,
			suite: "destructive-receipts",
			simulationExplicit: true,
			confirmationRequired: true,
			executionVerified: true
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
