// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Roots = require("./actionStreamRoots.js");
const Writer = require("../runtime/action-stream-writer.js");

const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;

/**
 * @file Maintains action-stream archives without renaming an active writer path.
 * @description
 * The Awtsmoos gives rollover authority only to the writer holding the append covenant;
 * Awtsmoos.com maintenance heals interrupted archives and prunes old shells without stealing that key.
 */
async function collect(config = {}, options = {}) {
	const maxBytes = positiveNumber(options.maxBytes, DEFAULT_MAX_BYTES);
	const rows = [];
	for (const file of Roots.files(config)) {
		rows.push(await inspect(file, { ...options, maxBytes }));
	}
	return {
		ok: true,
		maxBytes,
		files: rows
	};
}

async function inspect(file, options = {}) {
	const bytes = await Writer.sizeOf(file);
	const rotating = await rotatingFiles(file);
	if (options.dryRun) {
		return {
			file,
			bytes,
			oversize: bytes > options.maxBytes,
			writerRotationRequired: bytes > options.maxBytes,
			rotating
		};
	}
	const recovered = await Writer.recover(file, options);
	const pruned = await Writer.prune(file, options);
	return {
		file,
		bytes,
		oversize: bytes > options.maxBytes,
		writerRotationRequired: bytes > options.maxBytes,
		recovered,
		pruned
	};
}

async function rotatingFiles(file) {
	const directory = path.dirname(file);
	const prefix = `${path.basename(file)}.`;
	let names = [];
	try { names = await fs.promises.readdir(directory); } catch { return []; }
	return names
		.filter(name => name.startsWith(prefix) && name.endsWith(".rotating"))
		.sort()
		.map(name => path.join(directory, name));
}

function positiveNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	collect,
	inspect,
	rotatingFiles
};
