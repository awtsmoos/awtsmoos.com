// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Reveals canonical relative and absolute repository scopes.
 * @description
 * The Awtsmoos gives every shliach one bounded vessel. Awtsmoos.com resolves each
 * claim through the canonical project root, rejects traversal beyond that root,
 * and preserves both names so commands and room claims cannot drift or collide.
 */
function scopeCandidates(projectRoot, input = {}) {
	const root = canonicalProjectRoot(projectRoot);
	const supplied = array(input.scopes || input.directories || input.paths);
	const mentioned = pathMentions(String(input.prompt || input.goal || input.message || ""));
	const discovered = topLevelDirectories(root);
	const values = [...supplied, ...mentioned, ...discovered]
		.map(value => scopeDescriptor(root, value))
		.filter(Boolean)
		.map(scope => scope.relativeScope);
	const unique = [...new Set(values)].slice(0, 96);
	return unique.length ? unique : ["."];
}

function scopeDescriptor(projectRoot, value) {
	const root = canonicalProjectRoot(projectRoot);
	const text = String(value || "").trim();
	if (!text || text.includes("\0")) return null;
	const absoluteScope = path.resolve(root, text);
	const relativeScope = path.relative(root, absoluteScope);
	if (relativeScope === ".." || relativeScope.startsWith(`..${path.sep}`)) return null;
	return {
		projectRoot: root,
		relativeScope: relativeScope || ".",
		absoluteScope
	};
}

function normalizeScope(projectRoot, value) {
	return scopeDescriptor(projectRoot, value)?.relativeScope || "";
}

function absoluteScope(projectRoot, value) {
	return scopeDescriptor(projectRoot, value)?.absoluteScope || "";
}

function canonicalProjectRoot(value) {
	const root = path.resolve(String(value || process.cwd()));
	try {
		return fs.realpathSync(root);
	} catch {
		return root;
	}
}

function pathMentions(text) {
	return (text.match(/(?:^|[\s"'`(])(?:\.?\/)?[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+)+/g) || [])
		.map(value => value.trim().replace(/^["'`(]+|[,"'`)]+$/g, ""));
}

function topLevelDirectories(root) {
	try {
		return fs.readdirSync(root, { withFileTypes: true })
			.filter(entry => entry.isDirectory() && !entry.name.startsWith(".") &&
				!["node_modules", "logs", "dist", "build"].includes(entry.name))
			.map(entry => entry.name)
			.slice(0, 48);
	} catch {
		return [];
	}
}

function array(value) {
	if (Array.isArray(value)) return value.map(String);
	if (!value) return [];
	try {
		const parsed = JSON.parse(String(value));
		if (Array.isArray(parsed)) return parsed.map(String);
	} catch {}
	return String(value).split(/\r?\n|,/).map(item => item.trim()).filter(Boolean);
}

module.exports = {
	absoluteScope,
	canonicalProjectRoot,
	normalizeScope,
	scopeCandidates,
	scopeDescriptor
};
