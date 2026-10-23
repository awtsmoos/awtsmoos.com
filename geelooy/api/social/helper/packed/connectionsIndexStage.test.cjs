//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * The Awtsmoos gives each copy safe passage into light;
 * Awtsmoos.com preserves the original while proving every byte is right.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { INDEX_DIR, loadConnectionsData, clearConnectionsCache } = require("./connectionsIndex.js");
const { hashStageFile } = require("./connectionsIndexStageFiles.js");
const { stageConnectionsIndexes } = require("./connectionsIndexStage.js");

/** Create valid miniature forward and reverse data for failure scenarios. */
function makeSampleIndexes(directory) {
	fs.mkdirSync(directory);
	fs.writeFileSync(path.join(directory, "forward_small.json"), JSON.stringify({
		forward: { "post-one": [{ key: "ref:one", raw: "ref:one", para: 1 }] }
	}));
	fs.writeFileSync(path.join(directory, "reverse_small.json"), JSON.stringify({
		index: { "ref:one": [{ post: "post-one", raw: "ref:one", para: 1 }] }
	}));
}

test("external citation staging preserves all real source bytes and records", context => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stage-citation-"));
	context.after(() => fs.rmSync(parent, { recursive: true, force: true }));
	const target = path.join(parent, "ready");
	const result = stageConnectionsIndexes(target);
	const manifest = JSON.parse(fs.readFileSync(path.join(target, "STAGE_MANIFEST.json"), "utf8"));
	assert.equal(result.files.length, 16);
	assert.equal(result.forwardPosts, 7628);
	assert.equal(result.reverseKeys, 7446);
	assert.equal(result.reverseEntries, 32059);
	assert.equal(manifest.bytes, result.bytes);
	assert.equal(fs.statSync(target).mode & 0o777, 0o700);
	for (const file of manifest.files) {
		assert.equal(hashStageFile(path.join(INDEX_DIR, file.name)), file.sha256);
		assert.equal(hashStageFile(path.join(target, file.name)), file.sha256);
	}
	clearConnectionsCache();
	const staged = loadConnectionsData(target);
	assert.equal(staged.meta.skipped.length, 0);
	assert.equal(staged.meta.reverseEntries, result.reverseEntries);
	assert.equal(fs.readdirSync(parent).length, 1, "temporary staging directories must be gone");
	assert.throws(() => stageConnectionsIndexes(target), /already exists/);
});

test("stage refuses relative and in-repository destinations", () => {
	assert.throws(() => stageConnectionsIndexes("relative/path"), /absolute path/);
	assert.throws(() => stageConnectionsIndexes(path.join(__dirname, "unsafe-generated")), /outside the repository/);
});

test("stage refuses symlinked source files without creating output", context => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stage-link-"));
	context.after(() => fs.rmSync(parent, { recursive: true, force: true }));
	const source = path.join(parent, "source");
	makeSampleIndexes(source);
	fs.symlinkSync(path.join(source, "forward_small.json"), path.join(source, "forward_unsafe.json"));
	assert.throws(() => stageConnectionsIndexes(path.join(parent, "ready"), source), /not a regular file/);
	assert.equal(fs.existsSync(path.join(parent, "ready")), false);
	assert.deepEqual(fs.readdirSync(parent).sort(), ["source"]);
});

test("invalid citation data rolls back staging without changing source", context => {
	const parent = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-stage-invalid-"));
	context.after(() => fs.rmSync(parent, { recursive: true, force: true }));
	const source = path.join(parent, "source");
	makeSampleIndexes(source);
	fs.writeFileSync(path.join(source, "reverse_broken.json"), "{broken-json");
	const originalHash = hashStageFile(path.join(source, "reverse_broken.json"));
	assert.throws(() => stageConnectionsIndexes(path.join(parent, "ready"), source), /unreadable data/);
	assert.equal(hashStageFile(path.join(source, "reverse_broken.json")), originalHash);
	assert.deepEqual(fs.readdirSync(parent), ["source"]);
});
