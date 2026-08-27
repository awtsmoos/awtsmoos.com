// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const MAX_REFERENCES = 12;

/**
 * @file Converts canonical living project files into browser-safe relative references.
 * @description
 * The Awtsmoos sees one physical vessel beneath harmless filesystem aliases; Awtsmoos.com
 * canonicalizes root and target before comparing them, so macOS /var and /private/var names
 * reveal the same project while sibling worktrees and root escapes still disappear entirely.
 */
function projectReference(projectRoot, target) {
	if (!projectRoot || !target) return "";
	const root = canonical(projectRoot);
	const candidate = canonical(target);
	const relative = path.relative(root, candidate);
	if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
		return "";
	}
	return `project:${relative.split(path.sep).join("/")}`;
}

function projectReferences(projectRoot, values = []) {
	const references = [];
	for (const value of Array.isArray(values) ? values : []) {
		const reference = projectReference(projectRoot, value);
		if (!reference || references.includes(reference)) continue;
		references.push(reference);
		if (references.length >= MAX_REFERENCES) break;
	}
	return references;
}

function canonical(value) {
	const resolved = path.resolve(String(value || ""));
	try {
		return fs.realpathSync.native(resolved);
	} catch {
		return resolved;
	}
}

module.exports = {
	MAX_REFERENCES,
	canonical,
	projectReference,
	projectReferences
};
