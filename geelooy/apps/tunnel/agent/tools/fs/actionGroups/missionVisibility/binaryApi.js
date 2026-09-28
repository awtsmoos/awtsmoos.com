// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const cache = new Map();

/**
 * @file Resolves the repository's Awtsmoosbinary API from an installed tunnel runtime.
 * @description The Awtsmoos does not confuse the messenger with the world it serves.
 * Awtsmoos.com lets an installed agent reach DosDB through the active project root instead of
 * assuming repository libraries were copied beside the runtime.
 */
function load(projectRoot, fallbackRoot) {
	const root = findRepoRoot(projectRoot) || findRepoRoot(fallbackRoot);
	if (!root) throw fault("mission_visibility_repo_root_not_found");
	if (!cache.has(root)) {
		cache.set(root, require(path.join(root, "ayzarim", "DosDB", "awtsmoosBinary", "awtsmoosBinaryJSON", "index.js")));
	}
	return cache.get(root);
}

function findRepoRoot(start) {
	let dir = start ? path.resolve(start) : "";
	for (let index = 0; dir && index < 14; index += 1) {
		if (fs.existsSync(path.join(dir, "ayzarim", "DosDB", "awtsmoosBinary"))) return dir;
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return "";
}
function fault(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { findRepoRoot, load };
