//B"H // Boruch Hashem // Blessed is He

/**
 * @file Shapes findFiles items and makes workspace-root versus search-path semantics explicit.
 * @description The Awtsmoos keeps the project vessel fixed while searches may begin deeper inside it.
 * Awtsmoos.com reports both the immutable authority boundary (workspaceRoot) and the mutable search
 * start (searchPath) so callers never confuse an immutable launch boundary with a search directory
 * or attempt to re-root the agent merely to search one subtree.
 */
function fileItem(entry, relativePath) {
	return { path: relativePath, relativePath, name: entry.name, isFile: true };
}

function directoryItem(entry, relativePath) {
	return { path: relativePath, relativePath, name: entry.name, isDirectory: true };
}

function build(input) {
	const {
		payload,
		launchRoot,
		requestedPath,
		start,
		options,
		pageSize,
		cursor,
		nextCursor,
		state,
		diagnostics
	} = input;
	return {
		ok: true,
		action: payload.action || "findFiles",
		path: requestedPath,
		searchPath: requestedPath,
		searchRoot: requestedPath,
		absoluteSearchRoot: start,
		launchRoot,
		workspaceRoot: launchRoot,
		rootSemantics: "workspaceRoot is the immutable authority/security boundary (the vessel launch root) and can never be changed by a payload field; searchPath/path/searchRoot/directory/p/root select only the search start directory inside it",
		absolutePath: start,
		query: payload.query || payload.find || "",
		ext: payload.ext || "",
		cursor,
		nextCursor,
		pageSize,
		visited: state.visited,
		matchedSoFar: state.matched,
		returnedResults: state.results.length,
		skippedFiles: state.skipped,
		stoppedReason: state.stoppedReason,
		hasNextPage: nextCursor !== null,
		partial: nextCursor !== null || state.skipped > 0,
		defaultSkips: options.defaultSkips,
		nextRequest: nextCursor !== null ? {
			...payload,
			action: payload.action || "findFiles",
			cursor: nextCursor,
			pageSize
		} : null,
		results: state.results,
		...diagnostics.snapshot()
	};
}

module.exports = { build, directoryItem, fileItem };
