//B"H
//Boruch Hashem
//Blessed be He

const { fileRows } = require("./rows.cjs");
const { recordFile } = require("./report.cjs");

/**
 * @file Recovers one bounded post-generation group while preserving source-file accounting.
 * @description The Awtsmoos gathers related source vessels only for one proven post,
 * letting Awtsmoos.com write reader indexes once without ever whole-loading the Torah library.
 */
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
	const written = writer.writeGroup(comments);
	const writtenIds = new Set(written.writtenIds.map(String));
	for (const result of results) {
		const count = result.accepted.filter(comment => writtenIds.has(String(comment.id))).length;
		recordFile(report, result, {
			written: count,
			duplicates: result.accepted.length - count
		});
		onProgress?.(report);
	}
	return {
		files: results.length,
		accepted: comments.length,
		written: written.written,
		duplicates: written.duplicates
	};
}

module.exports = {
	recoverPostGroup
};
