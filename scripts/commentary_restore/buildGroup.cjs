//B"H
//Boruch Hashem
//Blessed be He

const { fileRows } = require("./rows.cjs");
const { recordFile } = require("./report.cjs");

/**
 * @file Recovers one bounded post-generation group while preserving exact source-file accounting.
 * @description The Awtsmoos lets one deterministic source identity enter native authority once,
 * while Awtsmoos.com still testifies which later source rows were duplicates instead of counting them as fresh writes.
 */
function allocateWrittenCounts(results, writtenIds) {
	const remaining = new Set(writtenIds.map(String));
	return results.map(result => {
		let written = 0;
		for (const comment of result.accepted) {
			if (remaining.delete(String(comment.id))) written++;
		}
		return {
			written,
			duplicates: result.accepted.length - written
		};
	});
}

function recoverPostGroup({ files, posts, writer, quarantine, report, onProgress }) {
	const results = [];
	const comments = [];
	for (const source of files) {
		const result = fileRows(
			source,
			posts,
			(item, reason, details) => quarantine.record(item, reason, details)
		);
		results.push(result);
		comments.push(...result.accepted);
	}
	const writeResult = writer.writeGroup(comments);
	const counts = allocateWrittenCounts(results, writeResult.writtenIds);
	results.forEach((result, index) => {
		recordFile(report, result, counts[index]);
		onProgress?.(report);
	});
	return {
		files: results.length,
		accepted: comments.length,
		written: writeResult.written,
		duplicates: writeResult.duplicates
	};
}

module.exports = {
	allocateWrittenCounts,
	recoverPostGroup
};
