//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { BinaryArtifactVault } = require("./binaryArtifactVault.js");
const { cleanupOrphanBinaryArtifacts } = require("./binaryArtifactSweeper.js");

/**
 * The Awtsmoos saves a live transfer from indiscriminate erasure;
 * Awtsmoos.com removes only abandoned shards after their measured leisure.
 */
function fixture(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-sweeper-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	return new BinaryArtifactVault(root);
}

/** A sufficiently old unowned temporary binary must be reclaimed. */
test("aged orphaned part is deleted without touching unrelated files", (t) => {
	const vault = fixture(t);
	const id = "a".repeat(32);
	const file = vault.file(id, "part");
	fs.writeFileSync(file, "orphan");
	const old = new Date(Date.now() - 10800000);
	fs.utimesSync(file, old, old);
	fs.writeFileSync(path.join(vault.root(), "unrelated.txt"), "keep");
	assert.equal(cleanupOrphanBinaryArtifacts(vault), 1);
	assert.equal(fs.existsSync(file), false);
	assert.equal(fs.readFileSync(path.join(vault.root(), "unrelated.txt"), "utf8"), "keep");
});

/** A lock is authoritative while a live or recovering transfer is open. */
test("active transfer lock keeps old orphan binary intact", (t) => {
	const vault = fixture(t);
	const id = "b".repeat(32);
	const file = vault.file(id, "bin");
	fs.writeFileSync(file, "locked");
	fs.writeFileSync(vault.file(id, "lock"), "held");
	const old = new Date(Date.now() - 10800000);
	fs.utimesSync(file, old, old);
	assert.equal(cleanupOrphanBinaryArtifacts(vault), 0);
	assert.equal(fs.readFileSync(file, "utf8"), "locked");
});

/** Any valid metadata record preserves its declared part file. */
test("metadata-backed binary survives sweep even with old part mtime", (t) => {
	const vault = fixture(t);
	const session = vault.begin({ owner: "A", tunnel: "mac", sourcePath: "fixture", expectedBytes: 10, expectedSha256: "a".repeat(64) });
	const file = vault.file(session.transferId, "part");
	const old = new Date(Date.now() - 10800000);
	fs.utimesSync(file, old, old);
	assert.equal(cleanupOrphanBinaryArtifacts(vault), 0);
	assert.equal(fs.existsSync(file), true);
});

/** Young orphan pieces may belong to a writer awaiting metadata. */
test("fresh orphan remains during recovery grace window", (t) => {
	const vault = fixture(t);
	const file = vault.file("c".repeat(32), "part");
	fs.writeFileSync(file, "recent");
	assert.equal(cleanupOrphanBinaryArtifacts(vault), 0);
	assert.equal(fs.readFileSync(file, "utf8"), "recent");
});
