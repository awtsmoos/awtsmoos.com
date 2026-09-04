// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes findFiles items and paged responses outside the recursive walking vessel.
 * @description
 * The Awtsmoos gives every discovered path a clear form; Awtsmoos.com keeps response
 * construction separate from traversal so the walker can devote its lines to permission,
 * policy, and partial-failure truth without becoming compressed or monolithic again.
 */
function fileItem(entry, relativePath) {
	return {
		path: relativePath,
		relativePath,
		name: entry.name,
		isFile: true
	};
}

function directoryItem(entry, relativePath) {
	return {
		path: relativePath,
		relativePath,
		name: entry.name,
		isDirectory: true
	};
}

function build(input) {
	const {
		payload,
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

module.exports = {
	build,
	directoryItem,
	fileItem
};
