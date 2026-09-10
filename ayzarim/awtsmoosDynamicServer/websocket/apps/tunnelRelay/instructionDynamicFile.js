//B"H
//Boruch Hashem
//Blessed be He

const fs = require("node:fs");
const path = require("node:path");
const Record = require("./instructionRecord.js");

const MAX_FILE_BYTES = 256 * 1024;
let cache = emptyCache();

/**
 * @file Loads an optional bounded dynamic instruction overlay with last-known-good semantics.
 * @description
 * The Awtsmoos may renew server doctrine without restarting every Tunnel. Awtsmoos.com
 * keeps the previous verified generation alive when a replacement file is missing or malformed.
 */
function loadDynamic(options = {}) {
	const filePath = selectedPath(options);
	let stat;
	try {
		stat = fs.statSync(filePath);
	} catch {
		return cache.filePath === filePath ? cache.records : [];
	}
	if (!stat.isFile() || stat.size > MAX_FILE_BYTES) {
		return retain(filePath, "instruction_file_invalid_size");
	}
	if (unchanged(filePath, stat)) return cache.records;
	try {
		const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
		const source = Array.isArray(parsed) ? parsed : parsed.instructions;
		if (!Array.isArray(source)) throw new Error("instruction_file_invalid_shape");
		const records = source
			.slice(0, 128)
			.map(Record.normalize)
			.filter(Boolean);
		cache = {
			filePath,
			mtimeMs: stat.mtimeMs,
			size: stat.size,
			records,
			lastError: ""
		};
		return records;
	} catch (error) {
		return retain(filePath, error.message || "instruction_file_invalid");
	}
}
/** Returns the active dynamic-file status without exposing instruction bodies. */
function status() {
	return {
		filePath: cache.filePath,
		mtimeMs: cache.mtimeMs,
		size: cache.size,
		count: cache.records.length,
		lastError: cache.lastError
	};
}

/** Chooses an operator-configured path or a stable server-local default. */
function selectedPath(options = {}) {
	return path.resolve(
		options.filePath ||
		process.env.AWTSMOOS_TUNNEL_INSTRUCTION_FILE ||
		path.join(process.cwd(), "dayuh", "tunnel-instructions.json")
	);
}

/** Keeps the previous verified generation for the same path after a bad replacement. */
function retain(filePath, message) {
	if (cache.filePath !== filePath) return [];
	cache.lastError = String(message || "instruction_file_invalid").slice(0, 160);
	return cache.records;
}

/** Detects whether the same bounded file generation has already been parsed. */
function unchanged(filePath, stat) {
	return cache.filePath === filePath &&
		cache.mtimeMs === stat.mtimeMs &&
		cache.size === stat.size;
}

/** Creates the empty loader state used at boot and by tests. */
function emptyCache() {
	return {
		filePath: "",
		mtimeMs: 0,
		size: 0,
		records: [],
		lastError: ""
	};
}

/** Resets module cache for deterministic isolated tests only. */
function resetForTest() {
	cache = emptyCache();
}

module.exports = {
	MAX_FILE_BYTES,
	loadDynamic,
	resetForTest,
	selectedPath,
	status
};