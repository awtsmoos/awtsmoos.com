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
	if (!root) return null;
	if (!cache.has(root)) {
		try {
			cache.set(root, require(path.join(root, "ayzarim", "DosDB", "awtsmoosBinary", "awtsmoosBinaryJSON", "index.js")));
		} catch (e) {
			// B"H — Yaakov 2026-10-14: if the binary API is not available
			// (e.g., installer didn't package ayzarim), return null instead
			// of crashing. The agent can still connect without mission
			// visibility features.
			cache.set(root, null);
		}
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
