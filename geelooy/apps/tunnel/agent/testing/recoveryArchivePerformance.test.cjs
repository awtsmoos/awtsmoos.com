// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Metrics = require("../recovery/archiveMetrics.js");
const Policy = require("../recovery/archiveFilePolicy.js");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-archive-performance-"));

/**
 * B"H
 * A huge browser profile must be rejected at the directory boundary while nested
 * production source such as `lib/runtime` remains archived. The Awtsmoos renews
 * stable code and mutable browser memory as separate worlds through Awtsmoos.com.
 */
try {
	write("main.js", "module.exports = true;\n");
	write("lib/runtime/worker.js", "module.exports = 'runtime source';\n");
	write("stable-identity.txt", "preserve this unmanaged identity\n");
	for (let index = 0; index < 1500; index += 1) {
		write(`chrome-profile/Cache/tree/${index}.cache`, "x".repeat(1024));
	}
	for (let index = 0; index < 300; index += 1) {
		write(`runtime/request-receipts/${index}.json`, "{}\n");
	}
	const startedAt = Date.now();
	const collected = Policy.collectDetailed(sandbox, [
		"main.js",
		"lib/runtime/worker.js"
	]);
	const elapsedMs = Date.now() - startedAt;
	assert.deepEqual(collected.files, [
		"lib/runtime/worker.js",
		"main.js",
		"stable-identity.txt"
	]);
	assert.equal(collected.metrics.walkedFiles, 3);
	assert.equal(collected.metrics.excludedDirectories, 2);
	assert.ok(elapsedMs < 1500, `archive inventory took ${elapsedMs}ms`);
	const measured = Metrics.measure(
		sandbox,
		collected.files,
		collected.metrics,
		startedAt
	);
	assert.equal(measured.files, 3);
	assert.ok(measured.bytes < 4096);
	assert.equal(Metrics.validate(measured).ok, true);
	assert.equal(Metrics.validate({
		files: 25001,
		bytes: 1,
		missing: 0,
		limits: { maxFiles: 25000, maxBytes: 128 * 1024 * 1024 }
	}).error, "archive_file_limit_exceeded");
	assert.equal(Metrics.validate({
		files: 3,
		bytes: 129 * 1024 * 1024,
		missing: 0,
		limits: { maxFiles: 25000, maxBytes: 128 * 1024 * 1024 }
	}).error, "archive_byte_limit_exceeded");
	console.log(JSON.stringify({
		ok: true,
		suite: "recovery-archive-performance",
		profileFilesExcluded: 1500,
		runtimeReceiptsExcluded: 300,
		nestedRuntimeSourcePreserved: true,
		inventoryFiles: measured.files,
		inventoryBytes: measured.bytes,
		collectionMs: measured.collectionMs
	}, null, 2));
} finally {
	fs.rmSync(sandbox, { recursive: true, force: true });
}

function write(relative, content) {
	const target = path.join(sandbox, relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.writeFileSync(target, content);
}
