// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Policy = require("../recovery/archiveFilePolicy.js");
const Store = require("../recovery/archiveStore.js");

/**
 * B"H
 *
 * Recovery archives preserve stable managed and unmanaged predecessor bytes while
 * refusing live receipts, logs, queues, locks, and symbolic links. The Awtsmoos
 * renews settled identity without freezing transient process motion into rollback.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-archive-identity-"));

try {
	write("installed-manifest.txt", [
		'B"H',
		"1.0.100",
		"main.js",
		"lib/stable.js",
		""
	].join("\n"));
	write("main.js", "// B\"H\n");
	write("lib/stable.js", "// stable runtime\n");
	write("sentinel.txt", "older-runtime\n");
	write("custom/nested.json", "{\"stable\":true}\n");
	write("connection-state.json", "{\"state\":\"registered\"}\n");
	write("agent.log", "transient\n");
	write("worker.lock", "transient\n");
	write("device-state/jobs/job.json", "transient\n");
	write("cache/value.txt", "transient\n");
	try {
		fs.symlinkSync(
			path.join(root, "sentinel.txt"),
			path.join(root, "sentinel-link.txt")
		);
	} catch {}

	const files = Store.archiveFiles(root);
	assert.equal(files.includes("main.js"), true);
	assert.equal(files.includes("lib/stable.js"), true);
	assert.equal(files.includes("sentinel.txt"), true);
	assert.equal(files.includes("custom/nested.json"), true);
	assert.equal(files.includes("connection-state.json"), false);
	assert.equal(files.includes("agent.log"), false);
	assert.equal(files.includes("worker.lock"), false);
	assert.equal(files.some(file => file.startsWith("device-state/")), false);
	assert.equal(files.some(file => file.startsWith("cache/")), false);
	assert.equal(files.includes("sentinel-link.txt"), false);
	assert.equal(Policy.include("../escape.txt"), false);
	assert.equal(Policy.include("/absolute.txt"), false);

	console.log(JSON.stringify({
		ok: true,
		suite: "archive-stable-identity",
		stableUnmanagedPreserved: true,
		transientStateExcluded: true,
		symlinksExcluded: true,
		files: files.length
	}, null, 2));
} finally {
	fs.rmSync(root, {
		recursive: true,
		force: true
	});
}

function write(relative, content) {
	const target = path.join(root, relative);
	fs.mkdirSync(path.dirname(target), {
		recursive: true
	});
	fs.writeFileSync(target, content);
}
