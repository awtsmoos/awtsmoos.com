//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const path = require("node:path");

const NAMES = Object.freeze(new Set([
	"AGENTS.md", "agents.md", "INSTRUCTIONS.md", "instructions.md", "CLAUDE.md", ".cursorrules"
]));

/**
 * @file Discovers actual-cased project instruction files from repository root to target scope.
 * @description
 * The Awtsmoos resolves filesystem aliases before judging locality and never counts one inode twice;
 * Awtsmoos.com walks broad root to local subtree so precedence follows the real directory vessel.
 */
function discoverPaths(payload = {}) {
	const root = canonicalDirectory(payload.projectRoot);
	if (!root) return [];
	const found = new Map();
	for (const directory of targetDirectories(root, payload.paths || payload.files || payload.targets || [])) {
		for (const ancestor of ancestors(root, directory)) addNamedFiles(found, ancestor);
	}
	addFile(found, path.join(root, ".github", "copilot-instructions.md"));
	return [...found.values()].sort((left, right) => {
		const depth = relativeDepth(root, left) - relativeDepth(root, right);
		return depth || left.localeCompare(right);
	});
}

function canonicalDirectory(value) {
	if (!value) return null;
	try {
		const resolved = fs.realpathSync(String(value));
		return fs.statSync(resolved).isDirectory() ? resolved : null;
	} catch {
		return null;
	}
}

function targetDirectories(root, values) {
	const input = Array.isArray(values) ? values : [values];
	const directories = new Set([root]);
	for (const value of input.filter(Boolean)) {
		const resolved = canonicalTarget(root, String(value));
		if (!resolved || !inside(root, resolved)) continue;
		let directory = resolved;
		try {
			if (fs.statSync(resolved).isFile()) directory = path.dirname(resolved);
		} catch {
			if (path.extname(resolved)) directory = path.dirname(resolved);
		}
		if (inside(root, directory)) directories.add(directory);
	}
	return [...directories];
}

function canonicalTarget(root, value) {
	const absolute = path.isAbsolute(value) ? value : path.resolve(root, value);
	try {
		return fs.realpathSync(absolute);
	} catch {
		try {
			const parent = fs.realpathSync(path.dirname(absolute));
			return path.join(parent, path.basename(absolute));
		} catch {
			return null;
		}
	}
}

function ancestors(root, target) {
	const result = [];
	let current = target;
	while (inside(root, current)) {
		result.unshift(current);
		if (current === root) break;
		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return result;
}

function inside(root, target) {
	const relative = path.relative(root, target);
	return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function addNamedFiles(found, directory) {
	let entries = [];
	try { entries = fs.readdirSync(directory); } catch { return; }
	for (const entry of entries) {
		if (NAMES.has(entry)) addFile(found, path.join(directory, entry));
	}
}

function addFile(found, candidate) {
	try {
		const stat = fs.statSync(candidate);
		if (!stat.isFile()) return;
		const real = fs.realpathSync(candidate);
		found.set(`${stat.dev}:${stat.ino}`, real);
	} catch {}
}

function relativeDepth(root, file) {
	return path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
}

module.exports = { NAMES, ancestors, discoverPaths, inside, targetDirectories };
