//B"H // Boruch Hashem // Blessed is He

const path = require("node:path");
const Diagnostics = require("./filesystemDiagnostics.js");
const Options = require("./findFilesOptions.js");
const Response = require("./findFilesResponse.js");
const Traversal = require("./findFilesTraversal.js");

/**
 * @file Finds files below one search directory while preserving the immutable launch root.
 * @description The Awtsmoos distinguishes the vessel's workspace root from the directory a search
 * begins inside. Awtsmoos.com accepts searchPath (preferred) and historical searchRoot/directory/
 * path/p/root aliases as search scope only; none can mutate the workspace root or escape its
 * existing path guards. The workspace root is the immutable/security authority; the search path
 * is only where the walk begins.
 */
async function findFiles(config, payload = {}) {
	const requestedPath = searchPath(payload);
	const start = Traversal.guardedStart(config, requestedPath);
	const options = Options.resolve(payload);
	options.defaultSkips = Options.DEFAULT_SKIPS;
	const diagnostics = Diagnostics.create(config, payload.diagnosticsLimit);
	const requestedPageSize = Options.integer(payload.pageSize || payload.maxResults || payload.limit, 100);
	const pageSize = Math.max(1, Math.min(requestedPageSize, 1000));
	const cursor = Options.integer(payload.cursor || payload.offset || 0, 0);
	const state = { results: [], visited: 0, matched: 0, skipped: 0, stoppedReason: "" };

	async function push(item, full) {
		if (!Options.matches(item, options)) return;
		let result = item;
		if (options.metadata) result = await Traversal.withStat(item, full, diagnostics);
		if (state.matched >= cursor && state.results.length < pageSize) state.results.push(result);
		state.matched += 1;
	}

	async function walk(directory, depth = 0) {
		if (Traversal.stopIfBounded(state, options, pageSize)) return;
		const entries = await Traversal.readEntries(config, directory, requestedPath, depth, diagnostics, state);
		if (!entries) return;
		for (const entry of entries) {
			if (Traversal.stopIfBounded(state, options, pageSize)) return;
			const full = path.join(directory, entry.name);
			const relative = path.relative(config.root, full).replace(/\\/g, "/");
			state.visited += 1;
			if (entry.isDirectory()) {
				if (options.skip.has(entry.name.toLowerCase())) {
					state.skipped += 1;
					continue;
				}
				if (options.includeDirs) await push(Response.directoryItem(entry, relative), full);
				await walk(full, depth + 1);
				continue;
			}
			if (!entry.isFile()) continue;
			if (!Traversal.guardFile(config, full, diagnostics, state)) continue;
			await push(Response.fileItem(entry, relative), full);
		}
	}

	await walk(start);
	const nextCursor = state.stoppedReason === "page_full" ? cursor + state.results.length : null;
	return Response.build({
		payload,
		launchRoot: config.root,
		requestedPath,
		start,
		options,
		pageSize,
		cursor,
		nextCursor,
		state,
		diagnostics
	});
}

/**
 * Resolves the search start directory. searchPath is canonical; searchRoot, directory,
 * path, p, and root are legacy aliases. None of these is the authority boundary: the
 * vessel workspace root (config.root) stays fixed no matter what the payload carries.
 */
function searchPath(payload = {}) {
	return payload.searchPath || payload.searchRoot || payload.directory || payload.path || payload.p || payload.root || ".";
}

function searchRoot(payload = {}) {
	return searchPath(payload);
}

module.exports = {
	DEFAULT_SKIPS: Options.DEFAULT_SKIPS,
	findFiles,
	matches: Options.matches,
	options: Options.resolve,
	searchPath,
	searchRoot
};
