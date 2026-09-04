// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Shapes paged-tree responses after traversal has finished gathering truthful evidence.
 * @description
 * The Awtsmoos lets traversal and presentation inhabit separate vessels; Awtsmoos.com
 * therefore keeps cursor arithmetic, tree text, and partial-result metadata outside the
 * recursive walker, so permission handling can remain readable without shrinking its song.
 */
function renderRows(rows, rootPath) {
	return rows.map(row => {
		const suffix = row.kind === "dir" ? "/" : "";
		return `${"  ".repeat(row.depth)}${path.posix.basename(row.path) || rootPath}${suffix}`;
	}).join("\n");
}

function build(payload, requestedPath, maxDepth, pageSize, cursor, got) {
	const nextCursor = got.hasNext
		? cursor + got.rows.length
		: null;
	return {
		ok: true,
		action: payload.action || "tree",
		root: got.root,
		path: requestedPath,
		absolutePath: got.rootFull,
		pageSize,
		cursor,
		nextCursor,
		hasNextPage: got.hasNext,
		partial: got.hasNext || got.skippedFiles > 0,
		nextRequest: got.hasNext ? {
			action: payload.action || "tree",
			p: requestedPath,
			maxDepth,
			pageSize,
			cursor: nextCursor
		} : null,
		returnedRows: got.rows.length,
		visitedRows: got.totalVisited,
		skippedFiles: got.skippedFiles,
		message: got.hasNext
			? "This is one tree page. Send nextRequest to continue."
			: "Tree page complete.",
		treeText: renderRows(got.rows, requestedPath),
		rows: got.rows,
		diagnostics: got.diagnostics,
		diagnosticsTruncated: got.diagnosticsTruncated,
		diagnosticsOmitted: got.diagnosticsOmitted
	};
}

module.exports = {
	build,
	renderRows
};
