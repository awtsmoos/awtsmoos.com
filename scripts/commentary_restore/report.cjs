//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Bounded aggregate testimony for commentary recovery.
 * @description Only counters are retained in memory; commentary bodies stream directly into the candidate.
 */
function createReport() {
	return {
		filesSeen: 0,
		filesAccepted: 0,
		commentsAccepted: 0,
		commentsWritten: 0,
		duplicates: 0,
		missingPosts: 0,
		emptyFiles: 0,
		malformed: 0,
		outOfRange: 0,
		byAlias: {}
	};
}

function aliasStats(report, aliasId) {
	if (!report.byAlias[aliasId]) {
		report.byAlias[aliasId] = {
			files: 0,
			comments: 0,
			written: 0,
			rejected: 0
		};
	}
	return report.byAlias[aliasId];
}

function recordFile(report, result, writeResult) {
	const alias = aliasStats(report, result.aliasId);
	report.filesSeen++;
	alias.files++;
	if (result.accepted.length) report.filesAccepted++;
	report.commentsAccepted += result.accepted.length;
	report.commentsWritten += writeResult.written;
	report.duplicates += writeResult.duplicates;
	report.missingPosts += Number(result.missingPost);
	report.emptyFiles += Number(result.emptyFile);
	report.malformed += result.malformed;
	report.outOfRange += result.outOfRange;
	alias.comments += result.accepted.length;
	alias.written += writeResult.written;
	alias.rejected += result.malformed + result.outOfRange + Number(result.missingPost);
}

function compactReport(report) {
	return {
		...report,
		byAlias: Object.fromEntries(
			Object.entries(report.byAlias).sort(([left], [right]) => left.localeCompare(right))
		)
	};
}

module.exports = {
	compactReport,
	createReport,
	recordFile
};
