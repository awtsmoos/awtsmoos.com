// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Diagnostics = require("./filesystemDiagnostics.js");
const Options = require("./findFilesOptions.js");
const Response = require("./findFilesResponse.js");
const Traversal = require("./findFilesTraversal.js");

/**
 * @file Finds files through a bounded readable walk with explicit partial-failure testimony.
 * @description
 * The Awtsmoos lets search continue past one barred descendant without hiding why it was
 * barred; Awtsmoos.com keeps secret policy absolute, expected skip directories quiet, and
 * operating-system failures visible through bounded safe diagnostics instead of one counter.
 */
async function findFiles(config, payload = {}) {
	const requestedPath = payload.path || payload.p || ".";
	const start = Traversal.guardedStart(config, requestedPath);
	const options = Options.resolve(payload);
	options.defaultSkips = Options.DEFAULT_SKIPS;
	const diagnostics = Diagnostics.create(config, payload.diagnosticsLimit);
	const requestedPageSize = Options.integer(
		payload.pageSize || payload.maxResults || payload.limit,
		100
	);
	const pageSize = Math.max(1, Math.min(requestedPageSize, 1000));
	const cursor = Options.integer(payload.cursor || payload.offset || 0, 0);
	const state = {
		results: [],
		visited: 0,
		matched: 0,
		skipped: 0,
		stoppedReason: ""
	};

	async function push(item, full) {
		if (!Options.matches(item, options)) return;
		let result = item;
		if (options.metadata) {
			result = await Traversal.withStat(item, full, diagnostics);
		}
		if (state.matched >= cursor && state.results.length < pageSize) {
			state.results.push(result);
		}
		state.matched += 1;
	}

	async function walk(directory, depth = 0) {
		if (Traversal.stopIfBounded(state, options, pageSize)) return;
		const entries = await Traversal.readEntries(
			config,
			directory,
			requestedPath,
			depth,
			diagnostics,
			state
		);
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
				if (options.includeDirs) {
					await push(Response.directoryItem(entry, relative), full);
				}
				await walk(full, depth + 1);
				continue;
			}
			if (!entry.isFile()) continue;
			if (!Traversal.guardFile(config, full, diagnostics, state)) continue;
			await push(Response.fileItem(entry, relative), full);
		}
	}

	await walk(start);
	const nextCursor = state.stoppedReason === "page_full"
		? cursor + state.results.length
		: null;
	return Response.build({
		payload,
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

module.exports = {
	DEFAULT_SKIPS: Options.DEFAULT_SKIPS,
	findFiles,
	matches: Options.matches,
	options: Options.resolve
};
