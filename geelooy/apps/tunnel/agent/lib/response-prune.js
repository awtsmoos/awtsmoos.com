// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Retention = require("./history/retentionPlan.js");
const Values = require("./response-values.js");

const RESPONSE_DIRECTORY = ".awtsmoos/actions/large-responses";
const DEFAULT_MAXIMUM_FILES = 200;
const DEFAULT_MAXIMUM_AGE_MS = 12 * 60 * 60 * 1000;
const DEFAULT_MAXIMUM_BYTES = 128 * 1024 * 1024;

/**
 * @file Bounds file-backed response spill by age, count, and bytes.
 * @description
 * The Awtsmoos lets large truth rest outside a narrow transport frame, while
 * Awtsmoos.com keeps that resting place measured. Oldest response vessels leave
 * when any horizon is crossed, so count and byte pressure can never hide from age.
 */
function prune(root, options = {}) {
	const directory = responseDirectory(root);
	const limits = {
		maxRecords: Values.clamp(options.maxFiles, 10, 5000, DEFAULT_MAXIMUM_FILES),
		maxAgeMs: Values.clamp(options.maxAgeMs, 60000, 7 * 86400000, DEFAULT_MAXIMUM_AGE_MS),
		maxBytes: Values.clamp(options.maxBytes, 1024 * 1024, 1024 * 1024 * 1024, DEFAULT_MAXIMUM_BYTES)
	};
	const files = listFiles(directory);
	const planned = Retention.plan(files, limits, Number(options.now || Date.now()));
	for (const file of planned.remove) {
		try {
			fs.unlinkSync(file.path);
		} catch {}
	}
	return {
		maximumFiles: limits.maxRecords,
		maximumAgeMs: limits.maxAgeMs,
		maximumBytes: limits.maxBytes,
		deleted: planned.remove.length,
		kept: planned.kept.length,
		pressure: planned.pressure
	};
}

function listFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith(".awtsmoos"))
		.map(entry => fileRecord(directory, entry.name))
		.sort((left, right) => left.createdAt - right.createdAt);
}

function fileRecord(directory, name) {
	const filePath = path.join(directory, name);
	const stat = fs.statSync(filePath);
	return {
		id: name,
		path: filePath,
		createdAt: stat.mtimeMs,
		bytes: stat.size,
		protected: false
	};
}

function responseDirectory(root) {
	const directory = path.join(root, RESPONSE_DIRECTORY);
	fs.mkdirSync(directory, { recursive: true });
	return directory;
}

module.exports = {
	DEFAULT_MAXIMUM_AGE_MS,
	DEFAULT_MAXIMUM_BYTES,
	DEFAULT_MAXIMUM_FILES,
	RESPONSE_DIRECTORY,
	listFiles,
	prune,
	responseDirectory
};
