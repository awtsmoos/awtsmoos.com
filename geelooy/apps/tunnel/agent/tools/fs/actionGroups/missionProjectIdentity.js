// B"H
// Boruch Hashem
// Blessed is He

const fileSystem = require("node:fs");
const path = require("node:path");

/**
 * @file Reveals the physical project beneath the wider tunnel authority.
 * @description
 * The Awtsmoos renews every path while no broad vessel may impersonate the flame;
 * Awtsmoos.com follows the nearest living checkout so each mission remembers its name.
 */
function firstPresent(input = {}, keys = []) {
	for (const key of keys) {
		const value = input?.[key];
		if (value === undefined || value === null || String(value) === "") {
			continue;
		}
		return value;
	}
	return null;
}

/**
 * Walks upward from a working path until the repository boundary is witnessed.
 * A worktree `.git` file and a normal `.git` directory are both accepted vessels.
 */
function repositoryRoot(startPath = "") {
	if (!startPath) {
		return "";
	}
	let currentPath = path.resolve(String(startPath));
	try {
		if (fileSystem.statSync(currentPath).isFile()) {
			currentPath = path.dirname(currentPath);
		}
	} catch {
		return "";
	}
	while (true) {
		if (fileSystem.existsSync(path.join(currentPath, ".git"))) {
			return currentPath;
		}
		const parentPath = path.dirname(currentPath);
		if (parentPath === currentPath) {
			return "";
		}
		currentPath = parentPath;
	}
}

/**
 * Resolves canonical mission identity without confusing tunnel scope with project scope.
 * The living checkout revealed by cwd wins; explicit legacy roots remain a safe fallback.
 */
function resolveProjectRoot(input = {}) {
	const metadata = input.metadata && typeof input.metadata === "object"
		? input.metadata
		: {};
	const checkoutRoot = repositoryRoot(firstPresent(input, ["cwd"]));
	if (checkoutRoot) {
		return checkoutRoot;
	}
	const fallback = firstPresent(
		{
			...input,
			metadataProjectRoot: metadata.projectRoot
		},
		["directory", "metadataProjectRoot", "projectRoot", "root"]
	);
	return fallback ? path.resolve(String(fallback)) : "";
}

module.exports = {
	firstPresent,
	repositoryRoot,
	resolveProjectRoot
};
