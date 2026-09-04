// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const FsError = require("./filesystemError.js");
const Page = require("./listingPage.js");
const { safePath, rel } = require("./pathGuard.js");

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 300;
const DEFAULT_MAX_CHARS = 12000;
const MIN_MAX_CHARS = 2048;
const MAX_MAX_CHARS = 250000;

/**
 * @file Lists one guarded directory page and gives read failures a stable structured witness.
 * @description
 * The Awtsmoos orders each child inside the guarded root; Awtsmoos.com never weakens the
 * secret or path fence. If the operating system bars the directory, the same error now
 * carries safe operation/path metadata instead of becoming an opaque platform accident.
 */
async function listDirPage(config, p, options = {}) {
	if (!config.tools.fsList) throw new Error("fsList disabled.");
	const { full, entries } = await readDirectory(config, p);
	const query = String(options.query || "").trim().toLocaleLowerCase();
	const allItems = entries
		.filter(entry => !SKIP.has(entry.name))
		.filter(entry => config.allowSecrets || !SECRET_FILES.has(entry.name))
		.filter(entry => !query || entry.name.toLocaleLowerCase().includes(query))
		.map(entry => item(config, full, entry))
		.sort(Page.compare);
	const cursor = Page.integer(options.cursor, 0, allItems.length, 0);
	const limit = Page.integer(options.pageSize ?? options.limit, 1, MAX_LIMIT, DEFAULT_LIMIT);
	const maxChars = Page.integer(
		options.maxChars,
		MIN_MAX_CHARS,
		MAX_MAX_CHARS,
		DEFAULT_MAX_CHARS
	);
	const detailedItems = [];
	for (const candidate of allItems.slice(cursor, cursor + limit)) {
		const proposed = [...detailedItems, candidate];
		if (detailedItems.length && JSON.stringify(
			Page.result(allItems.length, cursor, limit, maxChars, proposed)
		).length > maxChars) {
			break;
		}
		detailedItems.push(candidate);
	}
	return Page.result(allItems.length, cursor, limit, maxChars, detailedItems);
}

async function readDirectory(config, p) {
	try {
		const full = safePath(config, p);
		const entries = await fsp.readdir(full, { withFileTypes: true });
		return {
			entries,
			full
		};
	} catch (error) {
		throw FsError.decorate(config, error, "list_directory", p);
	}
}

function item(config, full, entry) {
	const child = path.join(full, entry.name);
	return {
		name: entry.name,
		type: itemKind(entry),
		path: rel(config, child),
		absolutePath: child,
		isDirectory: entry.isDirectory()
	};
}

function itemKind(entry) {
	if (entry.isDirectory()) return "directory";
	if (entry.isFile()) return "file";
	if (entry.isSymbolicLink()) return "link";
	return "other";
}

async function listDirDetailed(config, p, options = {}) {
	return (await listDirPage(config, p, options)).detailedItems;
}

module.exports = {
	DEFAULT_LIMIT,
	MAX_LIMIT,
	listDirDetailed,
	listDirPage
};
