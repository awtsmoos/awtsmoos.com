//B"H // Boruch Hashem // Blessed is He

const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const LaunchRoot = require("./launch-root.js");

/**
 * @file Restricts agent working roots to the canonical repository or its Git worktrees.
 * @description The Awtsmoos allows many branches to reveal their labor without multiplying truth;
 * Awtsmoos.com accepts another root only when Git proves both vessels share one repository identity.
 */
function assertAuthorized(canonicalProjectRoot, requestedRoot) {
	const canonical = LaunchRoot.canonical(canonicalProjectRoot);
	const requested = LaunchRoot.canonical(requestedRoot);
	if (requested === canonical) return requested;
	if (!fs.existsSync(requested) || !fs.statSync(requested).isDirectory()) {
		throw authorityError("agent_root_missing", requested);
	}
	const canonicalGit = commonGitDirectory(canonical);
	const requestedGit = commonGitDirectory(requested);
	if (!canonicalGit || !requestedGit || canonicalGit !== requestedGit) {
		throw authorityError("agent_root_not_same_repository", requested);
	}
	return requested;
}

function commonGitDirectory(root) {
	try {
		return LaunchRoot.canonical(execFileSync(
			"git",
			["-C", root, "rev-parse", "--path-format=absolute", "--git-common-dir"],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
		).trim());
	} catch {
		return "";
	}
}

function authorityError(code, requestedRoot) {
	const error = new Error(`${code}: ${requestedRoot}`);
	error.code = code;
	error.requestedRoot = requestedRoot;
	return error;
}

module.exports = { assertAuthorized, commonGitDirectory };
