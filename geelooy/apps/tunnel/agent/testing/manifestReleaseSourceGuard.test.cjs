//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Guard = require("../release/releaseSourceGuard.js");

/**
 * @file Proves release inventory cannot inherit shared-checkout drift.
 * @description The Awtsmoos grants publication one committed source identity. This fixture creates a
 * tiny Git earth and proves worktree edits, staged rollback, untracked runtime files, and a regressed
 * staged manifest all fail closed before manifest generation or startup verification can proceed.
 */
function fixture() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-release-guard-"));
	const agent = path.join(root, "geelooy/apps/tunnel/agent");
	fs.mkdirSync(agent, { recursive: true });
	fs.writeFileSync(path.join(agent, "manifest.txt"), "B\"H\n1.0.625\nmain.js\n", "utf8");
	fs.writeFileSync(path.join(agent, "main.js"), "//B\"H\nmodule.exports = true;\n", "utf8");
	git(root, ["init", "-q"]);
	git(root, ["config", "user.email", "guard@awtsmoos.test"]);
	git(root, ["config", "user.name", "Awtsmoos Guard"]);
	git(root, ["add", "."]);
	git(root, ["commit", "-qm", "B H baseline"]);
	return { root, agent };
}

function git(cwd, args) {
	childProcess.execFileSync("git", args, { cwd, stdio: "pipe" });
}

function restore(root) {
	git(root, ["reset", "--hard", "-q", "HEAD"]);
	git(root, ["clean", "-fdq"]);
}

test("clean committed Tunnel source passes", () => {
	const current = fixture();
	assert.equal(Guard.inspect({ repoRoot: current.root }).ok, true);
});

test("runtime worktree drift fails closed", () => {
	const current = fixture();
	fs.appendFileSync(path.join(current.agent, "main.js"), "// drift\n");
	const result = Guard.inspect({ repoRoot: current.root });
	assert.equal(result.ok, false);
	assert.equal(result.reason, "worktree_runtime_differs_from_source_ref");
});

test("staged runtime rollback fails closed", () => {
	const current = fixture();
	fs.rmSync(path.join(current.agent, "main.js"));
	git(current.root, ["add", "-u"]);
	const result = Guard.inspect({ repoRoot: current.root });
	assert.equal(result.ok, false);
	assert.equal(result.reason, "staged_runtime_differs_from_source_ref");
});

test("untracked runtime file fails closed", () => {
	const current = fixture();
	fs.writeFileSync(path.join(current.agent, "rogue.js"), "//B\"H\n", "utf8");
	const result = Guard.inspect({ repoRoot: current.root });
	assert.equal(result.ok, false);
	assert.equal(result.reason, "untracked_runtime_files_present");
});

test("regressed staged manifest fails even when no runtime source changed", () => {
	const current = fixture();
	const manifest = path.join(current.agent, "manifest.txt");
	fs.writeFileSync(manifest, "B\"H\n1.0.622\nmain.js\n", "utf8");
	git(current.root, ["add", "geelooy/apps/tunnel/agent/manifest.txt"]);
	const result = Guard.inspect({ repoRoot: current.root });
	assert.equal(result.ok, false);
	assert.equal(result.staleManifest, true);
	assert.equal(result.reason, "manifest_regressed_below_source_ref");
	restore(current.root);
});
