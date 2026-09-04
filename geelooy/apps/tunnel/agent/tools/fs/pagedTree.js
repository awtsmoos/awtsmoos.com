// B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const path = require("node:path");
const { SKIP, SECRET_FILES } = require("./constants.js");
const Diagnostics = require("./filesystemDiagnostics.js");
const FsError = require("./filesystemError.js");
const Response = require("./pagedTreeResponse.js");
const Support = require("./pagedTreeSupport.js");
const { rel } = require("./pathGuard.js");

/**
 * @file Walks a paged tree while inaccessible descendants become visible partial diagnostics.
 * @description
 * The Awtsmoos lets one barred branch remain barred without felling the entire tree;
 * Awtsmoos.com keeps the root failure explicit, keeps secret branches fenced, and reports
 * bounded safe diagnostics for descendants that the operating system refuses to reveal.
 */
async function collectTreeRows(config, p, maxDepth, cursor = 0, pageSize = 150, options = {}) {
	const diagnostics = Diagnostics.create(config, options.diagnosticsLimit);
	const rootFull = Support.guardedRoot(config, p);
	const rows = [];
	let seen = 0;
	let skippedFiles = 0;
	let hasNext = false;

	async function walk(full, depth) {
		if (rows.length >= pageSize) return;
		const stat = await guardedStat(full, depth);
		if (!stat) return;
		push(full, depth, stat);
		if (!stat.isDirectory() || depth >= maxDepth || rows.length >= pageSize) return;
		const entries = await guardedEntries(full, depth);
		if (!entries) return;
		for (const entry of entries) {
			if (rows.length >= pageSize) return;
			if (SKIP.has(entry.name)) continue;
			const child = path.join(full, entry.name);
			if (!config.allowSecrets && SECRET_FILES.has(entry.name)) {
				skippedFiles += 1;
				diagnostics.add("secret_path_blocked", "tree_secret_skip", child);
				continue;
			}
			await walk(child, depth + 1);
		}
	}

	function push(full, depth, stat) {
		if (seen >= cursor && rows.length < pageSize) {
			rows.push({
				path: rel(config, full) || ".",
				depth,
				kind: stat.isDirectory() ? "dir" : "file",
				bytes: stat.isFile() ? stat.size : 0
			});
		}
		seen += 1;
		if (rows.length >= pageSize) hasNext = true;
	}

	async function guardedStat(full, depth) {
		try {
			return await fsp.stat(full);
		} catch (error) {
			if (depth === 0) {
				throw FsError.decorate(config, error, "tree_stat_root", p);
			}
			skippedFiles += 1;
			diagnostics.add(error, "tree_stat", full);
			return null;
		}
	}

	async function guardedEntries(full, depth) {
		try {
			return await fsp.readdir(full, { withFileTypes: true });
		} catch (error) {
			if (depth === 0) {
				throw FsError.decorate(config, error, "tree_list_root", p);
			}
			skippedFiles += 1;
			diagnostics.add(error, "tree_list", full);
			return null;
		}
	}

	await walk(rootFull, 0);
	return {
		rows,
		totalVisited: seen,
		hasNext,
		skippedFiles,
		root: config.root,
		rootFull,
		...diagnostics.snapshot()
	};
}

async function pagedTree(config, payload = {}) {
	if (!config.tools.fsTree) throw new Error("fsTree disabled.");
	const p = payload.path || payload.p || ".";
	const maxDepth = Support.number(payload.maxDepth || payload.depth, 12);
	const pageSize = Math.max(1, Support.number(payload.pageSize || payload.limit, 150));
	const page = Math.max(1, Support.number(payload.page, 1));
	const fallbackCursor = Math.max(0, (page - 1) * pageSize);
	const cursor = Support.number(payload.cursor, fallbackCursor);
	const got = await collectTreeRows(config, p, maxDepth, cursor, pageSize, payload);
	return Response.build(payload, p, maxDepth, pageSize, cursor, got);
}

module.exports = {
	collectTreeRows,
	pagedTree,
	renderRows: Response.renderRows
};
