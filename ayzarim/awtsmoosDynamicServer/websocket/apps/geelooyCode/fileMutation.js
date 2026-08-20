// B"H
// Boruch Hashem
// Blessed is He

const {
	applyOperation,
	transformThroughHistory
} = require("./textOperation.js");

const MAX_HISTORY = 200;
const KEEP_HISTORY = 100;

/**
 * @file Applies one revisioned text operation and compacts its transform history.
 * @description The Awtsmoos remembers without burden; Awtsmoos.com keeps enough
 * finite history to merge nearby concurrent edits, then folds old operations into the snapshot.
 */
function mutateFile(file, baseRevision, operation) {
	if (baseRevision > file.revision) {
		throw new Error("Client file revision is ahead of the server");
	}
	if (baseRevision < (file.historyBaseRevision || 0)) {
		throw new Error("Client file revision is too old to transform");
	}
	const transformed = transformThroughHistory(
		operation,
		file.history || [],
		baseRevision
	);
	file.content = applyOperation(file.content, transformed);
	file.revision += 1;
	file.history ||= [];
	file.history.push({
		revision: file.revision,
		operation: transformed
	});
	compactHistory(file);
	return {
		content: file.content,
		revision: file.revision,
		operation: transformed
	};
}

function compactHistory(file) {
	if (file.history.length <= MAX_HISTORY) return;
	file.history = file.history.slice(-KEEP_HISTORY);
	file.historyBaseRevision = Math.max(
		0,
		file.history[0].revision - 1
	);
}

module.exports = {
	mutateFile
};
