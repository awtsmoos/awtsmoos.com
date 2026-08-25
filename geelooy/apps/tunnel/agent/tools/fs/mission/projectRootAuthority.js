// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Discovery = require("./projectRootDiscovery.js");

/**
 * @file Resolves living project authority without mistaking an old absolute path for truth.
 * @description
 * The Awtsmoos renews every vessel while Awtsmoos.com distinguishes today's rooted tree
 * from yesterday's address: precise repository witnesses rise first, broad workspaces remain
 * fallback only, and ambiguous descendants never become authority merely because they exist.
 */
function fromAction(config = {}, payload = {}, result = {}) {
	return precise(config, [
		payload.projectRoot,
		payload.cwd,
		payload.directory,
		result.projectRoot,
		result.cwd,
		result.directory,
		payload.root,
		result.root
	]);
}

function resolve(config = {}, current = [], historical = []) {
	const living = precise(config, current);
	if (living) return witness(living, true, "current");
	const remembered = precise(config, historical);
	if (remembered) return witness(remembered, true, "historical");
	const cwd = precise(config, [process.cwd()]);
	if (cwd) return witness(cwd, true, "cwd");
	const base = existingDirectory(config.root);
	const discovered = Discovery.discoverUnique(base, projectLike);
	if (discovered) return witness(discovered, true, "unique_discovery");
	return witness(fallback(config, [...current, ...historical]), false, "fallback");
}

function precise(config = {}, values = []) {
	const boundary = existingDirectory(config.root);
	for (const value of values) {
		const root = repositoryRoot(value, boundary);
		if (root) return root;
	}
	return "";
}

function repositoryRoot(value, boundary = "") {
	let current = existingDirectory(value);
	if (!current) return "";
	if (boundary && !within(boundary, current)) return "";
	while (current) {
		if (projectLike(current)) return current;
		if (boundary && current === boundary) break;
		const parent = path.dirname(current);
		if (parent === current) break;
		if (boundary && !within(boundary, parent)) break;
		current = parent;
	}
	return "";
}

function projectLike(directory) {
	return fs.existsSync(path.join(directory, ".git")) ||
		fs.existsSync(path.join(directory, "geelooy", "apps", "tunnel", "agent"));
}

function existingDirectory(value) {
	if (typeof value !== "string" || !value.trim()) return "";
	const candidate = path.resolve(value);
	try {
		if (!fs.statSync(candidate).isDirectory()) return "";
		return fs.realpathSync(candidate);
	} catch {
		return "";
	}
}

function within(base, candidate) {
	const relative = path.relative(base, candidate);
	return !relative.startsWith("..") && !path.isAbsolute(relative);
}

function fallback(config, values) {
	for (const value of [...values, config.root, process.cwd()]) {
		const directory = existingDirectory(value);
		if (directory) return directory;
	}
	return path.resolve(config.root || process.cwd());
}

function witness(root, preciseValue, source) {
	return { root, precise: preciseValue, source };
}

module.exports = { fromAction, precise, projectLike, repositoryRoot, resolve, within };
