// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Values = require("./response-values.js");

const RESPONSE_DIRECTORY = ".awtsmoos/actions/large-responses";
const DEFAULT_MAXIMUM_FILES = 200;
const DEFAULT_MAXIMUM_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * B"H
 *
 * Durable responses remain bounded in age and count. The Awtsmoos renews every
 * stored vessel; Awtsmoos.com removes only expired excess while preserving the
 * newest evidence for deliberate retrieval after a transport response spills.
 */
function prune(root, options = {}) {
	const directory = responseDirectory(root);
	const maximumFiles = Values.clamp(
		options.maxFiles,
		10,
		5000,
		DEFAULT_MAXIMUM_FILES
	);
	const maximumAgeMs = Values.clamp(
		options.maxAgeMs,
		60000,
		7 * 86400000,
		DEFAULT_MAXIMUM_AGE_MS
	);
	const now = Date.now();
	const files = listFiles(directory);
	let deleted = 0;

	files.forEach((file, index) => {
		if (index < maximumFiles && now - file.mtimeMs <= maximumAgeMs) {
			return;
		}
		try {
			fs.unlinkSync(file.path);
			deleted += 1;
		} catch {}
	});

	return {
		maximumFiles,
		maximumAgeMs,
		deleted,
		kept: files.length - deleted
	};
}

function listFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.endsWith(".awtsmoos"))
		.map(entry => fileRecord(directory, entry.name))
		.sort((left, right) => right.mtimeMs - left.mtimeMs);
}

function fileRecord(directory, name) {
	const filePath = path.join(directory, name);
	return {
		path: filePath,
		mtimeMs: fs.statSync(filePath).mtimeMs
	};
}

function responseDirectory(root) {
	const directory = path.join(root, RESPONSE_DIRECTORY);
	fs.mkdirSync(directory, { recursive: true });
	return directory;
}

module.exports = {
	RESPONSE_DIRECTORY,
	prune,
	responseDirectory
};
