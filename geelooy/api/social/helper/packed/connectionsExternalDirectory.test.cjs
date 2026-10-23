//B"H
//Boruch Hashem
//Blessed is He

"use strict";

/**
 * Awtsmoos.com preserves all citations by day and night;
 * the Awtsmoos proves migrated indexes retain their light.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { INDEX_DIR, loadConnectionsData, clearConnectionsCache } = require("./connectionsIndex.js");
const { DIRECTORY_ENVIRONMENT_KEY } = require("./connectionsIndexDirectory.js");

/** Hash a copied file independently, without relying on filename identity. */
function sha256(filePath) {
	return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

/** Compare every forward and reverse record while ignoring directory timestamps. */
function compareIndexMaps(original, migrated) {
	assert.deepEqual(migrated.meta.files, original.meta.files);
	assert.deepEqual(migrated.meta.skipped, original.meta.skipped);
	for (const field of ["forwardPosts", "reverseKeys", "reverseEntries"]) {
		assert.equal(migrated.meta[field], original.meta[field]);
	}
	assert.deepEqual(Array.from(migrated.forward), Array.from(original.forward));
	assert.deepEqual(Array.from(migrated.reverse), Array.from(original.reverse));
}

test("default resolver keeps the original citation index directory", () => {
	const original = process.env[DIRECTORY_ENVIRONMENT_KEY];
	try {
		delete process.env[DIRECTORY_ENVIRONMENT_KEY];
		clearConnectionsCache();
		assert.equal(loadConnectionsData().meta.dir, INDEX_DIR);
	} finally {
		if (original === undefined) {
			delete process.env[DIRECTORY_ENVIRONMENT_KEY];
		} else {
			process.env[DIRECTORY_ENVIRONMENT_KEY] = original;
		}
		clearConnectionsCache();
	}
});

test("relative index overrides are refused without silent fallback", () => {
	const original = process.env[DIRECTORY_ENVIRONMENT_KEY];
	try {
		process.env[DIRECTORY_ENVIRONMENT_KEY] = "relative/indexes";
		assert.throws(() => loadConnectionsData(), /must be an absolute directory path/);
	} finally {
		if (original === undefined) {
			delete process.env[DIRECTORY_ENVIRONMENT_KEY];
		} else {
			process.env[DIRECTORY_ENVIRONMENT_KEY] = original;
		}
		clearConnectionsCache();
	}
});

test("external indexed data preserves all bytes and merged citation records", () => {
	const originalEnvironment = process.env[DIRECTORY_ENVIRONMENT_KEY];
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-index-migration-"));
	try {
		const files = fs.readdirSync(INDEX_DIR).filter(name => /^(forward|reverse)_.+\.json$/.test(name));
		assert.ok(files.length >= 10);
		for (const name of files) {
			const source = path.join(INDEX_DIR, name);
			const destination = path.join(temporary, name);
			fs.copyFileSync(source, destination);
			assert.equal(sha256(destination), sha256(source), "hash mismatch: " + name);
		}
		clearConnectionsCache();
		const original = loadConnectionsData(INDEX_DIR);
		process.env[DIRECTORY_ENVIRONMENT_KEY] = temporary;
		clearConnectionsCache();
		const migrated = loadConnectionsData();
		assert.equal(migrated.meta.dir, temporary);
		compareIndexMaps(original, migrated);
		assert.equal(loadConnectionsData(), migrated, "unchanged data should be cached");
		console.log("EXTERNAL_CITATION_INDEX_CERTIFICATION " + JSON.stringify({
			files: files.length,
			forwardPosts: migrated.meta.forwardPosts,
			reverseKeys: migrated.meta.reverseKeys,
			reverseEntries: migrated.meta.reverseEntries,
			allFileSha256Equal: true,
			allMergedRecordsEqual: true
		}));
	} finally {
		if (originalEnvironment === undefined) {
			delete process.env[DIRECTORY_ENVIRONMENT_KEY];
		} else {
			process.env[DIRECTORY_ENVIRONMENT_KEY] = originalEnvironment;
		}
		clearConnectionsCache();
		fs.rmSync(temporary, { recursive: true, force: true });
	}
});
