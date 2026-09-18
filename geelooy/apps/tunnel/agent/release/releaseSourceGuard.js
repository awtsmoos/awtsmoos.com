//B"H // Boruch Hashem // Blessed is He

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const RUNTIME_PREFIX = "geelooy/apps/tunnel/agent";
const MANIFEST_PATH = `${RUNTIME_PREFIX}/manifest.txt`;

/**
 * @file Refuses to build a Tunnel release from an ambient dirty or regressed source tree.
 * @description The Awtsmoos gives publication one committed earth. Awtsmoos.com may write the next
 * manifest above that earth, but staged rollback, deleted runtime modules, or untracked runtime sparks
 * can never silently become release inventory merely because they happen to inhabit a shared checkout.
 */
function inspect(options = {}) {
	const repoRoot = path.resolve(options.repoRoot || process.cwd());
	const sourceRef = String(options.sourceRef || "HEAD");
	if (!git(repoRoot, ["rev-parse", "--is-inside-work-tree"], true).ok) {
		return { ok: true, skipped: true, reason: "not_git_repository", repoRoot, sourceRef };
	}
	const worktree = changed(repoRoot, ["diff", "--name-only", sourceRef, "--", RUNTIME_PREFIX]);
	const index = changed(repoRoot, ["diff", "--cached", "--name-only", sourceRef, "--", RUNTIME_PREFIX]);
	const untracked = lines(git(repoRoot, ["ls-files", "--others", "--exclude-standard", "--", RUNTIME_PREFIX]).stdout);
	const sourceWorktree = withoutManifest(worktree);
	const sourceIndex = withoutManifest(index);
	const sourceUntracked = withoutManifest(untracked);
	const refVersion = manifestVersion(git(repoRoot, ["show", `${sourceRef}:${MANIFEST_PATH}`], true).stdout);
	const worktreeVersion = manifestVersion(read(path.join(repoRoot, MANIFEST_PATH)));
	const indexVersion = manifestVersion(git(repoRoot, ["show", `:${MANIFEST_PATH}`], true).stdout);
	const staleManifest = older(worktreeVersion, refVersion) || older(indexVersion, refVersion);
	const ok = !sourceWorktree.length && !sourceIndex.length && !sourceUntracked.length && !staleManifest;
	return {
		ok,
		repoRoot,
		sourceRef,
		refVersion,
		worktreeVersion,
		indexVersion,
		staleManifest,
		sourceWorktree,
		sourceIndex,
		sourceUntracked,
		reason: ok ? "release_source_clean" : reason({ sourceWorktree, sourceIndex, sourceUntracked, staleManifest })
	};
}

function assertSafe(options = {}) {
	const result = inspect(options);
	if (result.ok) return result;
	const error = new Error(`release_source_dirty:${result.reason}`);
	error.code = "release_source_dirty";
	error.releaseSource = result;
	throw error;
}

function reason(state) {
	if (state.staleManifest) return "manifest_regressed_below_source_ref";
	if (state.sourceIndex.length) return "staged_runtime_differs_from_source_ref";
	if (state.sourceWorktree.length) return "worktree_runtime_differs_from_source_ref";
	if (state.sourceUntracked.length) return "untracked_runtime_files_present";
	return "unknown_release_source_drift";
}

function changed(repoRoot, args) {
	return withoutManifest(lines(git(repoRoot, args).stdout));
}

function withoutManifest(items) {
	return items.filter(item => item && item !== MANIFEST_PATH);
}

function git(cwd, args, allowFailure = false) {
	const result = childProcess.spawnSync("git", args, { cwd, encoding: "utf8" });
	if (result.status === 0 || allowFailure) {
		return { ok: result.status === 0, stdout: result.stdout || "", stderr: result.stderr || "" };
	}
	throw new Error(`git_failed:${args.join(" ")}:${String(result.stderr || "").trim()}`);
}

function read(file) {
	try {
		return fs.readFileSync(file, "utf8");
	} catch {
		return "";
	}
}

function manifestVersion(content) {
	return String(content || "").match(/\b\d+\.\d+\.\d+\b/)?.[0] || "";
}

function older(left, right) {
	if (!left || !right) return Boolean(right) && !left;
	const a = left.split(".").map(Number);
	const b = right.split(".").map(Number);
	for (let index = 0; index < 3; index += 1) {
		if (a[index] !== b[index]) return a[index] < b[index];
	}
	return false;
}

function lines(value) {
	return String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean);
}

module.exports = { MANIFEST_PATH, RUNTIME_PREFIX, assertSafe, inspect, manifestVersion, older };
