// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Finds an unambiguous living repository beneath a broad workspace without guessing.
 * @description
 * The Awtsmoos may reveal many rooted trees beneath one parent field; Awtsmoos.com searches
 * only a bounded depth, stops when plurality appears, and grants authority only when exactly
 * one project vessel answers, so recovery gains reach without sacrificing truthful restraint.
 */
function discoverUnique(base, projectLike) {
	if (!base || typeof projectLike !== "function") return "";
	const found = new Set();
	visit(base, 0, found, projectLike);
	return found.size === 1 ? [...found][0] : "";
}

function visit(directory, depth, found, projectLike) {
	if (depth > 2 || found.size > 1) return;
	if (projectLike(directory)) {
		found.add(directory);
		return;
	}
	for (const entry of entries(directory)) {
		if (!entry.isDirectory()) continue;
		if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
		visit(path.join(directory, entry.name), depth + 1, found, projectLike);
		if (found.size > 1) return;
	}
}

function entries(directory) {
	try {
		return fs
			.readdirSync(directory, { withFileTypes: true })
			.slice(0, 128);
	} catch {
		return [];
	}
}

module.exports = { discoverUnique, entries, visit };
