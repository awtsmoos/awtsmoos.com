// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { SECRET_FILES } = require("./constants.js");

/**
 * @file Confines every filesystem path to the configured project root.
 * @description
 * The Awtsmoos renews root, child, and real filesystem identity together.
 * Awtsmoos.com rejects sibling-prefix tricks and symlink escapes before any read,
 * write, batch, JSON carrier, or nested action can touch the physical filesystem.
 */
function safePath(config, given) {
	const root = path.resolve(requiredText(config?.root, "project_root"));
	const input = normalizedInput(given);
	const full = path.isAbsolute(input)
		? path.resolve(input)
		: path.resolve(root, input);
	assertInside(root, full, "path_outside_project_root");
	assertRealAncestry(root, full);
	return full;
}

function assertInside(root, candidate, code = "path_outside_project_root") {
	const rootKey = comparisonPath(root);
	const candidateKey = comparisonPath(candidate);
	const relative = path.relative(rootKey, candidateKey);
	const outside = relative === ".." ||
		relative.startsWith(`..${path.sep}`) ||
		path.isAbsolute(relative);
	if (outside) {
		const error = new Error(`${code}: ${candidate}`);
		error.code = code;
		error.root = root;
		error.candidate = candidate;
		throw error;
	}
}

function assertRealAncestry(root, candidate) {
	const realRoot = realPathOrResolved(root);
	const existing = nearestExisting(candidate);
	if (!existing) return;
	const realExisting = fs.realpathSync.native(existing);
	assertInside(realRoot, realExisting, "symlink_outside_project_root");
	if (!fs.existsSync(candidate)) return;
	const realCandidate = fs.realpathSync.native(candidate);
	assertInside(realRoot, realCandidate, "symlink_outside_project_root");
}

function nearestExisting(candidate) {
	let current = candidate;
	while (!fs.existsSync(current)) {
		const parent = path.dirname(current);
		if (parent === current) return null;
		current = parent;
	}
	return current;
}

function realPathOrResolved(value) {
	try {
		return fs.realpathSync.native(value);
	} catch {
		return path.resolve(value);
	}
}

function comparisonPath(value) {
	const resolved = path.resolve(value);
	return process.platform === "win32" || process.platform === "darwin"
		? resolved.toLowerCase()
		: resolved;
}

function normalizedInput(given) {
	const input = given === undefined || given === null || given === ""
		? "."
		: String(given);
	if (input.includes("\0")) {
		const error = new Error("path_contains_null_byte");
		error.code = "path_contains_null_byte";
		throw error;
	}
	return input;
}

function requiredText(value, label) {
	const text = String(value || "").trim();
	if (!text) throw new Error(`missing_${label}`);
	return text;
}

function rel(config, full) {
	return path.relative(path.resolve(config.root), full).replace(/\\/g, "/") || ".";
}

function assertNotSecret(config, full) {
	if (config.allowSecrets) return;
	const segments = path.resolve(full).split(path.sep).filter(Boolean);
	const secret = segments.find((segment) => SECRET_FILES.has(segment));
	if (secret) {
		const error = new Error(`Refusing secret-like path by default: ${secret}`);
		error.code = "secret_path_blocked";
		throw error;
	}
}

module.exports = {
	assertInside,
	assertNotSecret,
	rel,
	safePath
};
