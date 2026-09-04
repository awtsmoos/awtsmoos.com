// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Executor = require("../executor/index.js");
const Find = require("../findFiles.js");
const Listing = require("../listing.js");
const ReadWrite = require("../readWrite.js");
const Tree = require("../pagedTree.js");
const Harness = require("./structuredFilesystemErrorsHarness.cjs");

/**
 * @file Proves structured filesystem failures remain safe, partial, and durable across executor IPC.
 * @description
 * The Awtsmoos lets a missing file say missing, a barred branch say permission, and a secret
 * remain sealed; Awtsmoos.com carries that testimony through the real worker pool without
 * leaking outside paths or letting one inaccessible descendant erase every visible sibling.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Direct failures remain explicit; recursive failures remain partial; executor IPC preserves
 * only the allowlisted filesystem witness.
 */
(async () => {
	const root = await Harness.createGarden();
	const config = Harness.config(root);
	try {
		await directFailures(config);
		await partialTraversal(config, root);
		await executorRoundTrip();
		console.log(JSON.stringify({
			ok: true,
			suite: "structured-filesystem-errors",
			directErrorsStructured: true,
			partialTraversalPreserved: true,
			executorMetadataPreserved: true
		}, null, 2));
	} finally {
		Executor.shutdown();
		await Harness.remove(root);
	}
})().catch(error => {
	Executor.shutdown();
	console.error(error);
	process.exitCode = 1;
});

async function directFailures(config) {
	await assert.rejects(
		ReadWrite.readText(config, "missing.txt"),
		error => witness(error, "ENOENT", "missing", "read_text", "missing.txt")
	);
	await assert.rejects(
		Listing.listDirPage(config, "missing-directory"),
		error => witness(error, "ENOENT", "missing", "list_directory", "missing-directory")
	);
	await assert.rejects(ReadWrite.readText(config, ".env"), error => {
		assert.equal(error.code, "secret_path_blocked");
		assert.equal(error.filesystem.kind, "policy");
		assert.equal(error.filesystem.policy, true);
		return true;
	});
}

async function partialTraversal(config, root) {
	await Harness.withBlockedDirectory(root, async () => {
		const tree = await Tree.pagedTree(config, { p: ".", pageSize: 100 });
		assert.equal(tree.partial, true);
		assert.ok(tree.rows.some(row => row.path === "open/visible.txt"));
		assert.ok(tree.diagnostics.some(item => item.kind === "permission" && item.path === "blocked"));
		const found = await Find.findFiles(config, { p: ".", query: "visible", pageSize: 100 });
		assert.equal(found.partial, true);
		assert.ok(found.results.some(item => item.path === "open/visible.txt"));
		assert.ok(found.diagnostics.some(item => item.kind === "permission" && item.path === "blocked"));
	});
}

async function executorRoundTrip() {
	const missing = `__awtsmoos_structured_missing_${process.pid}.txt`;
	await assert.rejects(Executor.execute({ action: "read", p: missing }), error => {
		assert.equal(error.code, "ENOENT");
		assert.equal(error.filesystem.kind, "missing");
		assert.equal(error.filesystem.operation, "read_text");
		assert.equal(error.filesystem.path, missing);
		return true;
	});
}

function witness(error, code, kind, operation, expectedPath) {
	assert.equal(error.code, code);
	assert.equal(error.filesystem.kind, kind);
	assert.equal(error.filesystem.operation, operation);
	assert.equal(error.filesystem.path, expectedPath);
	return true;
}
