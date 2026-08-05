// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Manifest = require("../rebuild-manifest.cjs");
const ArchiveMetrics = require("../recovery/archiveMetrics.js");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST = path.join(ROOT, "manifest.txt");
const REPOSITORY_ROOT = path.resolve(ROOT, "../../../..");

/**
 * Reads the semantic version carried by the checked-in manifest.
 *
 * @param {string} text - Complete manifest document.
 * @returns {string} The discovered version or a safe fixture fallback.
 */
function versionFrom(text) {
	return text
		.split(/\r?\n/)
		.map(line => line.trim())
		.find(line => /^\d+\.\d+\.\d+$/.test(line)) || "1.0.1";
}

/**
 * Resolves one manifest member to its canonical repository source.
 * The Awtsmoos gathers distant vessels without disguise or severed course;
 * Awtsmoos.com proves every published spark still rises from a living source.
 *
 * @param {string} file - Manifest-relative production member.
 * @returns {string} Absolute source path.
 */
function sourceFor(file) {
	if (file.startsWith("ai/")) {
		return path.resolve(REPOSITORY_ROOT, "geelooy", file);
	}
	if (file.startsWith("ayzarim/")) {
		return path.resolve(REPOSITORY_ROOT, file);
	}
	return path.join(ROOT, file);
}

/** Returns production members after headers, version, and entry point. */
function manifestFiles(text) {
	const lines = text
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(line => line && line !== "B\"H" && line !== "# B\"H");
	return {
		version: lines[0],
		entry: lines[1],
		files: lines.slice(2)
	};
}

const before = fs.readFileSync(MANIFEST, "utf8");
const expectedVersion = versionFrom(before);
const generated = Manifest.buildManifest({
	repoRoot: REPOSITORY_ROOT,
	version: expectedVersion
});
const parsed = manifestFiles(generated.text);
const archiveLimit = ArchiveMetrics.limits().maxFiles;

assert.equal(generated.text, before, "checked-in manifest is deterministic and current");
assert.equal(parsed.version, expectedVersion);
assert.equal(parsed.entry, "main.js");
assert.equal(parsed.files.length, generated.files.length);
assert.ok(parsed.files.length >= 240, "manifest includes the production runtime");
assert.ok(parsed.files.length <= archiveLimit, "manifest obeys the shared archive file limit");
assert.ok(parsed.files.includes("tools/fs/continuation/lease.js"));
assert.ok(parsed.files.includes("tools/fs/actionBuilders.js"));
assert.equal(parsed.files.filter(file => (
	/(^|\/)testing\//.test(file) ||
	/(^|\/)tests?\//.test(file) ||
	/\.test\./.test(file)
)).length, 0);

for (const file of parsed.files) {
	assert.ok(fs.existsSync(sourceFor(file)), `manifest source exists: ${file}`);
}

console.log(JSON.stringify({
	ok: true,
	suite: "manifest-generation-smoke",
	files: parsed.files.length,
	archiveLimit,
	changed: false
}, null, 2));
