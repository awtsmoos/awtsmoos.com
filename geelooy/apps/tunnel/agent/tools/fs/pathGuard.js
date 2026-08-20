// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { SECRET_FILES } = require("./constants.js");

/**
 * @file Canonically confines every filesystem path to the immutable project root.
 * @description
 * The Awtsmoos renews names and their physical referents in one truthful instant.
 * Awtsmoos.com accepts harmless filesystem aliases that resolve beneath the root,
 * while a child-shaped symlink that resolves beyond the vessel is named and rejected.
 */
function safePath(config, given) {
	const root = realPathOrResolved(requiredText(config?.root, "project_root"));
	const input = normalizedInput(given);
	const lexical = path.isAbsolute(input)
		? path.resolve(input)
		: path.resolve(root, input);
	const canonical = canonicalCandidate(lexical);
	if (isInside(root, canonical)) return canonical;
	const code = isInside(root, lexical)
		? "symlink_outside_project_root"
		: "path_outside_project_root";
	throwOutside(root, canonical, code);
}

/**
 * Resolves the deepest existing ancestor and rebuilds any nonexistent suffix beneath
 * its physical location, preserving safe create/write operations under canonical root.
 *
 * @param {string} candidate Candidate path that may not exist yet.
 * @returns {string} Canonical physical path.
 */
function canonicalCandidate(candidate) {
	const existing = nearestExisting(candidate);
	if (!existing) return path.resolve(candidate);
	const realExisting = fs.realpathSync.native(existing);
	const suffix = path.relative(existing, candidate);
	return suffix ? path.resolve(realExisting, suffix) : realExisting;
}

/**
 * Answers containment without throwing, allowing callers to distinguish ordinary
 * outside paths from symlinks whose lexical name began inside the vessel.
 *
 * @param {string} root Canonical project authority.
 * @param {string} candidate Candidate path.
 * @returns {boolean} Whether candidate remains beneath root.
 */
function isInside(root, candidate) {
	const relative = path.relative(comparisonPath(root), comparisonPath(candidate));
	return relative !== ".." &&
		!relative.startsWith(`..${path.sep}`) &&
		!path.isAbsolute(relative);
}

function assertInside(root, candidate, code = "path_outside_project_root") {
	if (isInside(root, candidate)) return;
	throwOutside(root, candidate, code);
}

function throwOutside(root, candidate, code) {
	const error = new Error(`${code}: ${candidate}`);
	error.code = code;
	error.root = root;
	error.candidate = candidate;
	throw error;
}

function nearestExisting(candidate) {
	let current = path.resolve(candidate);
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
	if (!input.includes("\0")) return input;
	const error = new Error("path_contains_null_byte");
	error.code = "path_contains_null_byte";
	throw error;
}

function requiredText(value, label) {
	const text = String(value || "").trim();
	if (text) return text;
	throw new Error(`missing_${label}`);
}

function rel(config, full) {
	const root = realPathOrResolved(config.root);
	return path.relative(root, canonicalCandidate(full)).replace(/\\/g, "/") || ".";
}

function assertNotSecret(config, full) {
	if (config.allowSecrets) return;
	const segments = path.resolve(full).split(path.sep).filter(Boolean);
	const secret = segments.find(segment => SECRET_FILES.has(segment));
	if (!secret) return;
	const error = new Error(`Refusing secret-like path by default: ${secret}`);
	error.code = "secret_path_blocked";
	throw error;
}

module.exports = {
	assertInside,
	assertNotSecret,
	canonicalCandidate,
	isInside,
	rel,
	safePath
};
