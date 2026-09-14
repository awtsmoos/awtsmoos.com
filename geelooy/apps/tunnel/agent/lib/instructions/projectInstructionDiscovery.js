//B"H
//Boruch Hashem
//Blessed be He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Paths = require("./projectInstructionPaths.js");

const MAX_FILE_BYTES = 32768;
const MAX_TOTAL_BYTES = 98304;

/**
 * @file Reads scoped project instruction layers with deterministic provenance and content hashes.
 * @description
 * The Awtsmoos does not flatten root and subtree wisdom into anonymous prose;
 * Awtsmoos.com preserves path, depth, precedence, digest, and bounded body for every applicable layer.
 */
function discover(payload = {}) {
	const root = canonicalRoot(payload.projectRoot);
	if (!root) return [];
	const includeBodies = payload.includeProjectInstructionBodies === true;
	let budget = MAX_TOTAL_BYTES;
	return Paths.discoverPaths(payload).map((file, index) => {
		const source = fs.readFileSync(file);
		const allowed = Math.max(0, Math.min(source.length, MAX_FILE_BYTES, budget));
		const body = source.subarray(0, allowed).toString("utf8");
		budget -= allowed;
		return {
			path: file,
			relativePath: path.relative(root, file) || path.basename(file),
			scope: path.relative(root, path.dirname(file)) || ".",
			depth: depth(root, file),
			precedence: index + 1,
			bytes: source.length,
			includedBytes: allowed,
			truncated: allowed < source.length,
			sha256: crypto.createHash("sha256").update(source).digest("hex"),
			...(includeBodies ? { body } : {})
		};
	});
}

function summarize(layers = []) {
	return layers.map(layer => ({
		path: layer.path,
		relativePath: layer.relativePath,
		scope: layer.scope,
		depth: layer.depth,
		precedence: layer.precedence,
		bytes: layer.bytes,
		truncated: layer.truncated,
		sha256: layer.sha256
	}));
}

function canonicalRoot(value) {
	try {
		const root = fs.realpathSync(String(value || ""));
		return fs.statSync(root).isDirectory() ? root : null;
	} catch {
		return null;
	}
}

function depth(root, file) {
	return path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
}

module.exports = { MAX_FILE_BYTES, MAX_TOTAL_BYTES, discover, summarize };
