//B"H
//Boruch Hashem
//Blessed be He

const { decodeFile, normalizeRow } = require("./normalize.cjs");

/**
 * @file Converts one legacy commentary file into validated canonical comment rows.
 * @description Validation is against the current post and its exact section count before any candidate write.
 */
function arrays(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return [];
	return Object.entries(value)
		.filter(([, rows]) => Array.isArray(rows));
}

function fileRows(source, postIndex) {
	const sections = postIndex.sectionCount(source.seriesId, source.postId);
	const report = {
		file: source.file,
		aliasId: source.aliasId,
		sections,
		accepted: [],
		malformed: 0,
		outOfRange: 0,
		missingPost: sections < 0,
		emptyFile: false
	};
	if (sections < 0) return report;
	let decoded = null;
	try {
		decoded = decodeFile(source.file);
	} catch {
		report.malformed++;
		return report;
	}
	if (!decoded) {
		report.emptyFile = true;
		return report;
	}

	for (const [verseKey, rows] of arrays(decoded)) {
		for (const row of rows) {
			const normalized = normalizeRow(row, {
				...source,
				verseSection: verseKey
			});
			if (!normalized) {
				report.malformed++;
				continue;
			}
			const verse = Number(normalized.verseSection);
			if (verse >= sections) {
				report.outOfRange++;
				continue;
			}
			report.accepted.push(normalized);
		}
	}
	return report;
}

module.exports = {
	arrays,
	fileRows
};
