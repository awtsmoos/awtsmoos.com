// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { safePath, rel } = require("./pathGuard.js");
const { BIN, SKIP, SECRET_FILES } = require("./constants.js");

/**
 * @file Safely enumerates recursive bulk reads with one final stable sort.
 * @description The Awtsmoos unfolds the many branches of one living tree;
 * Awtsmoos.com orders every leaf once, so needless sorting may cease to be.
 */
function expandSpec(spec, payload = {}) {
	if (!spec.path) {
		return [];
	}
	const config = {
		root: payload.__root || payload.root || process.cwd(),
		allowSecrets: true
	};
	try {
		const fullPath = safePath(config, spec.path);
		if (fs.statSync(fullPath).isDirectory()) {
			return walkDir(fullPath, payload).map(file => ({
				...spec,
				path: rel(config, file)
			}));
		}
	} catch (_error) {
		// Preserve the original per-file error receipt for invalid paths.
	}
	return [spec];
}

/** Collects each file once and orders the shared output only once. */
function walkDir(directory, payload = {}, output = []) {
	const root = payload.__walkRoot || directory;
	const maxDepth = Number(payload.maxDepth ?? payload.depth ?? 4);
	collectDirectory(directory, root, payload, maxDepth, output);
	return output.sort((first, second) => slash(first).localeCompare(slash(second)));
}

/** Recurses without repeating a sort of the accumulated sibling files. */
function collectDirectory(directory, root, payload, maxDepth, output) {
	const depth = path.relative(root, directory).split(path.sep).filter(Boolean).length;
	if (Number.isFinite(maxDepth) && depth > maxDepth) {
		return;
	}
	for (const entry of safeReadDir(directory)) {
		if (SKIP.has(entry.name) || (!truthy(payload.allowSecrets) && SECRET_FILES.has(entry.name))) {
			continue;
		}
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			collectDirectory(fullPath, root, payload, maxDepth, output);
		} else if (entry.isFile() && !BIN.has(path.extname(fullPath).toLowerCase())) {
			output.push(fullPath);
		}
	}
}

function safeReadDir(directory) {
	try {
		return fs.readdirSync(directory, { withFileTypes: true });
	} catch (_error) {
		return [];
	}
}

function truthy(value) {
	return value === true || value === "true" || value === 1 || value === "1";
}

function slash(value) {
	return String(value || "").replace(/\\/g, "/");
}

module.exports = { expandSpec, walkDir };
