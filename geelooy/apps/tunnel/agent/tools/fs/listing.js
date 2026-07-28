// B"H
const fsp = require("fs/promises");
const path = require("path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const { safePath, rel } = require("./pathGuard.js");

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 300;
const DEFAULT_MAX_CHARS = 12000;
const MIN_MAX_CHARS = 2048;
const MAX_MAX_CHARS = 250000;

function itemKind(entry) {
	if (entry.isDirectory()) return "directory";
	if (entry.isFile()) return "file";
	if (entry.isSymbolicLink()) return "link";
	return "other";
}

async function listDirPage(config, p, options = {}) {
	if (!config.tools.fsList) throw new Error("fsList disabled.");

	const full = safePath(config, p);
	const entries = await fsp.readdir(full, { withFileTypes: true });
	const query = String(options.query || "").trim().toLocaleLowerCase();
	const allItems = entries
		.filter(entry => !SKIP.has(entry.name))
		.filter(entry => config.allowSecrets || !SECRET_FILES.has(entry.name))
		.filter(entry => !query || entry.name.toLocaleLowerCase().includes(query))
		.map(entry => {
			const child = path.join(full, entry.name);
			return {
				name: entry.name,
				type: itemKind(entry),
				path: rel(config, child),
				absolutePath: child,
				isDirectory: entry.isDirectory()
			};
		})
		.sort(compareItems);

	const cursor = boundedInteger(options.cursor, 0, allItems.length, 0);
	const requestedLimit = options.pageSize ?? options.limit;
	const limit = boundedInteger(requestedLimit, 1, MAX_LIMIT, DEFAULT_LIMIT);
	const maxChars = boundedInteger(
		options.maxChars,
		MIN_MAX_CHARS,
		MAX_MAX_CHARS,
		DEFAULT_MAX_CHARS
	);
	const detailedItems = [];
	for (const candidate of allItems.slice(cursor, cursor + limit)) {
		const proposed = [...detailedItems, candidate];
		const projected = pageResult(
			allItems.length,
			cursor,
			limit,
			maxChars,
			proposed
		);
		if (
			detailedItems.length
			&& JSON.stringify(projected).length > maxChars
		) break;
		detailedItems.push(candidate);
	}

	return pageResult(
		allItems.length,
		cursor,
		limit,
		maxChars,
		detailedItems
	);
}

async function listDirDetailed(config, p, options = {}) {
	return (await listDirPage(config, p, options)).detailedItems;
}

function pageResult(totalEntries, cursor, limit, maxChars, detailedItems) {
	const nextCursor = cursor + detailedItems.length;
	return {
		items: detailedItems.map(item => item.isDirectory
			? `${item.name}/`
			: item.name),
		detailedItems,
		totalEntries,
		returnedEntries: detailedItems.length,
		cursor,
		nextCursor: nextCursor < totalEntries ? nextCursor : null,
		hasNextPage: nextCursor < totalEntries,
		limit,
		maxChars
	};
}

function compareItems(a, b) {
	if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
	return a.name.localeCompare(b.name);
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

module.exports = {
	DEFAULT_LIMIT,
	MAX_LIMIT,
	listDirDetailed,
	listDirPage
};
