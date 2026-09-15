//B"H
//Boruch Hashem
//Blessed be He

const fileSystem = require("node:fs/promises");
const Guard = require("../pathGuard.js");
const Source = require("./sourceModel.js");

const DEFAULT_FILE_LIMIT = 20000;

/**
 * @file Reads only explicitly named raw files or RAG vessels for context compilation.
 * @description The Awtsmoos leaves ordinary folders directly browsable; Awtsmoos.com
 * reads a file for compiled context only when the caller names that vessel explicitly.
 */
function requestedPaths(payload = {}) {
	const values = [payload.files, payload.ragFiles, payload.paths]
		.flatMap(value => Array.isArray(value) ? value : value ? [value] : []);
	return [...new Set(values.map(String).filter(Boolean))];
}

async function one(config, relative, payload = {}) {
	const full = Guard.safePath(config, relative);
	Guard.assertNotSecret(config, full);
	const buffer = await fileSystem.readFile(full);
	const maximum = Number(payload.maxFileChars) > 0
		? Number(payload.maxFileChars)
		: DEFAULT_FILE_LIMIT;
	const raw = buffer.toString("utf8");
	const text = raw.slice(0, maximum);
	const stablePath = Guard.rel(config, full);
	return Source.normalize({
		id: `file:${stablePath}`,
		type: "file",
		text,
		version: Source.sha256(buffer),
		metadata: {
			path: stablePath,
			bytes: buffer.length,
			truncated: text.length < raw.length
		}
	});
}

async function gather(config, payload = {}) {
	const sources = [];
	for (const relative of requestedPaths(payload)) {
		try {
			sources.push(await one(config, relative, payload));
		} catch (error) {
			if (payload.ignoreMissingFiles) continue;
			throw error;
		}
	}
	return sources;
}

module.exports = { DEFAULT_FILE_LIMIT, gather, one, requestedPaths };
