//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const { CANDIDATE_ROOT, SOURCE_ROOTS } = require("./config.cjs");
const { prepareCandidate } = require("./candidate.cjs");
const { PostIndex } = require("./postIndex.cjs");
const { compactReport, createReport, recordFile } = require("./report.cjs");
const { fileRows } = require("./rows.cjs");
const { commentaryFiles } = require("./sourceFiles.cjs");
const { CandidateWriter } = require("./writer.cjs");

/**
 * @file Streaming candidate builder for recovered canonical Torah commentary.
 * @description Each source file is decoded, validated, written, and released before the next file begins.
 */
function progress(report) {
	if (report.filesSeen % 250 !== 0) return;
	process.stderr.write(
		`commentary recovery ${report.filesSeen} files, ${report.commentsWritten} comments, `
		+ `${report.outOfRange} out-of-range, ${report.missingPosts} missing posts\n`
	);
}

function saveReport(report) {
	const file = path.join(CANDIDATE_ROOT, "recovery-report.txt");
	fs.writeFileSync(file, `${JSON.stringify(compactReport(report), null, 2)}\n`);
	return file;
}

function build() {
	prepareCandidate();
	const report = createReport();
	const posts = new PostIndex();
	const writer = new CandidateWriter(CANDIDATE_ROOT);
	try {
		for (const sourceRoot of SOURCE_ROOTS) {
			for (const source of commentaryFiles(sourceRoot)) {
				const result = fileRows(source, posts);
				const written = writer.writeBatch(result.accepted);
				recordFile(report, result, written);
				progress(report);
			}
		}
	} finally {
		writer.close();
		posts.close();
	}
	const reportFile = saveReport(report);
	console.log(JSON.stringify({
		success: true,
		candidateRoot: CANDIDATE_ROOT,
		reportFile,
		...compactReport(report)
	}, null, 2));
	return report;
}

if (require.main === module) {
	try {
		build();
	} catch (error) {
		console.error(error.stack || error);
		process.exitCode = 1;
	}
}

module.exports = {
	build
};
