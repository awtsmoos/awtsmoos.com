// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const Baselines = require("../manifestBaselines.cjs");

/**
 * @file Recreates the stale-checkout regression inside an isolated Git vessel.
 * @description
 * The Awtsmoos places 1.0.407 beneath remote 1.0.429, and Awtsmoos.com proves
 * the next revealed patch is 1.0.430 rather than a descent into old numbering.
 */

function git(root, argumentsList) {
	return execFileSync("git", argumentsList, {
		cwd: root,
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"]
	}).trim();
}

function writeManifest(root, version) {
	const file = path.join(root, Baselines.DEFAULT_MANIFEST_PATH);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, `B"H\n${version}\nmain.js\nmain.js\n`, "utf8");
	return file;
}

test("stale checkout rises above origin main", () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-manifest-baseline-"));
	git(root, ["init", "--quiet"]);
	git(root, ["config", "user.name", "Awtsmoos Test"]);
	git(root, ["config", "user.email", "test@awtsmoos.invalid"]);
	const file = writeManifest(root, "1.0.407");
	git(root, ["add", "."]);
	git(root, ["commit", "--quiet", "-m", "old manifest"]);
	const oldCommit = git(root, ["rev-parse", "HEAD"]);
	writeManifest(root, "1.0.429");
	git(root, ["commit", "--quiet", "-am", "new manifest"]);
	const newCommit = git(root, ["rev-parse", "HEAD"]);
	git(root, ["update-ref", "refs/remotes/origin/main", newCommit]);
	git(root, ["reset", "--hard", "--quiet", oldCommit]);

	const result = Baselines.resolveNextVersion({
		file,
		repoRoot: root,
		offline: true
	});

	assert.equal(result.highest, "1.0.429");
	assert.equal(result.version, "1.0.430");
	assert(result.baselines.some(item => (
		item.source === "refs/remotes/origin/main" && item.version === "1.0.429"
	)));
});
