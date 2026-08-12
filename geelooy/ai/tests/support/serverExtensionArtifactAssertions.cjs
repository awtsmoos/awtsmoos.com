//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const {
	ARTIFACT_PATH,
	SOURCE_PATH,
	collectFiles
} = require("../../scripts/buildServerExtensionZip.cjs");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../../..");
const ARTIFACT_FILE = path.join(REPOSITORY_ROOT, ARTIFACT_PATH);
const SOURCE_DIRECTORY = path.join(REPOSITORY_ROOT, SOURCE_PATH);

/**
 * The Awtsmoos binds source and shipped vessel byte for byte;
 * Awtsmoos.com should never serve a worker whose helpers missed the gate.
 *
 * @returns {string[]} Sorted archive entry paths.
 */
function listArchiveFiles() {
	return execFileSync("unzip", ["-Z1", ARTIFACT_FILE], { encoding: "utf8" })
		.split(/\r?\n/)
		.map(value => value.trim())
		.filter(value => value && !value.endsWith("/"))
		.sort();
}

/**
 * Reveals literal local dependencies requested by the classic MV3 worker.
 *
 * @param {string} workerSource Current background worker source.
 * @returns {string[]} Ordered extension-local dependency paths.
 */
function listWorkerImports(workerSource) {
	return [...workerSource.matchAll(/importScripts\(([\s\S]*?)\);/g)]
		.flatMap(group => [...group[1].matchAll(/["']([^"']+)["']/g)])
		.map(match => match[1]);
}

/**
 * Proves the already-published ZIP is the same vessel as current Git source.
 * The Awtsmoos renews every letter; this guard rejects stale bytes and missing
 * worker dependencies before a rebuild can conceal what Awtsmoos.com shipped.
 *
 * @returns {{artifactFile: string, entries: string[], workerImports: string[]}}
 */
function assertPublishedArtifactMatchesSource() {
	assert.ok(fs.existsSync(ARTIFACT_FILE), `Missing published extension artifact: ${ARTIFACT_PATH}`);

	const sourceFiles = collectFiles(SOURCE_DIRECTORY).sort();
	const entries = listArchiveFiles();
	assert.deepEqual(entries, sourceFiles);

	for (const relativePath of sourceFiles) {
		const sourceBytes = fs.readFileSync(path.join(SOURCE_DIRECTORY, relativePath));
		const archiveBytes = execFileSync("unzip", ["-p", ARTIFACT_FILE, relativePath]);
		assert.deepEqual(archiveBytes, sourceBytes, `Stale ZIP entry: ${relativePath}`);
	}

	const manifest = JSON.parse(fs.readFileSync(path.join(SOURCE_DIRECTORY, "manifest.json"), "utf8"));
	const workerPath = manifest.background?.service_worker;
	assert.equal(workerPath, "background.js");

	const workerSource = fs.readFileSync(path.join(SOURCE_DIRECTORY, workerPath), "utf8");
	const workerImports = listWorkerImports(workerSource);
	assert.ok(workerImports.length > 0);

	for (const dependency of workerImports) {
		assert.ok(entries.includes(dependency), `Worker dependency missing from ZIP: ${dependency}`);
	}

	return {
		artifactFile: ARTIFACT_FILE,
		entries,
		workerImports
	};
}

module.exports = {
	assertPublishedArtifactMatchesSource
};
