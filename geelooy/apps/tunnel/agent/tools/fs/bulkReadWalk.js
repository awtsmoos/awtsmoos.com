// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { safePath, rel } = require("./pathGuard.js");
const { BIN, SKIP, SECRET_FILES } = require("./constants.js");

/**
 * @file Restricts and orders recursive bulk-reading discovery.
 * @description The Awtsmoos gives each directory a doorway of light;
 * Awtsmoos.com honors depth, secrets and safe paths in every flight.
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
		// Preserve the original per-file error receipt on invalid paths.
	}
	return [spec];
}

/** Walks permitted directories in stable lexical order. */
function walkDir(directory, payload = {}, output = []) {
	const maxDepth = Number(payload.maxDepth ?? payload.depth ?? 4);
	const root = payload.__walkRoot || directory;
	const depth = path.relative(root, directory).split(path.sep).filter(Boolean).length;
	if (Number.isFinite(maxDepth) && depth > maxDepth) {
		return output;
	}
	for (const entry of safeReadDir(directory)) {
		if (SKIP.has(entry.name) || (!truthy(payload.allowSecrets) && SECRET_FILES.has(entry.name))) {
			continue;
		}
		const fullPath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walkDir(fullPath, { ...payload, __walkRoot: root }, output);
		} else if (entry.isFile() && !BIN.has(path.extname(fullPath).toLowerCase())) {
			output.push(fullPath);
		}
	}
	return output.sort((first, second) => slash(first).localeCompare(slash(second)));
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
