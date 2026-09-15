//B"H
//Boruch Hashem
//Blessed be He

const { decodeFile, normalizeRow } = require("./normalize.cjs");

/**
 * @file Converts one legacy commentary file into proven current-generation rows.
 * @description The Awtsmoos guards each coordinate: uncertainty is quarantined rather than attached by guesswork.
 */
function arrays(value) {
	if (!value || typeof value !== "object" || Array.isArray(value)) return [];
	return Object.entries(value).filter(([, rows]) => Array.isArray(rows));
}

function reject(onReject, source, reason, details = {}) {
	onReject(source, reason, details);
}

function fileRows(source, postIndex, onReject = () => {}) {
	const sections = postIndex.sectionCount(source.seriesId, source.postId);
	const report = {
		file: source.file,
		sourceId: source.sourceId,
		aliasId: source.aliasId,
		sections,
		accepted: [],
		malformed: 0,
		outOfRange: 0,
		missingPost: sections < 0,
		emptyFile: false
	};
	if (sections < 0) {
		reject(onReject, source, "MISSING_POST");
		return report;
	}
	let decoded;
	try {
		decoded = decodeFile(source.file);
	} catch (error) {
		report.malformed++;
		reject(onReject, source, "MALFORMED_FILE", { error: String(error?.message || error) });
		return report;
	}
	if (!decoded) {
		report.emptyFile = true;
		reject(onReject, source, "EMPTY_FILE");
		return report;
	}
	for (const [verseKey, rows] of arrays(decoded)) {
		for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			const normalized = normalizeRow(rows[rowIndex], {
				...source,
				verseSection: verseKey
			});
			if (!normalized) {
				report.malformed++;
				reject(onReject, source, "MALFORMED_ROW", { verseKey, rowIndex });
				continue;
			}
			const verse = Number(normalized.verseSection);
			if (verse >= sections) {
				report.outOfRange++;
				reject(onReject, source, "OUT_OF_RANGE", { verse, sections, rowIndex });
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
