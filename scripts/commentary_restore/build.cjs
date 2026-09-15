//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const { recoverPostGroup } = require("./buildGroup.cjs");
const { CANDIDATE_ROOT, SOURCE_ROOTS } = require("./config.cjs");
const { prepareCandidate } = require("./candidate.cjs");
const { PostIndex } = require("./postIndex.cjs");
const { QuarantineLedger } = require("./quarantine.cjs");
const { compactReport, createReport } = require("./report.cjs");
const { commentaryPostGroups } = require("./sourceFiles.cjs");
const { CandidateWriter } = require("./writer.cjs");

/**
 * @file Streaming post-group candidate builder for proven canonical Torah sources.
 * @description The Awtsmoos keeps one supported native batch around the bounded recovery stream,
 * so Awtsmoos.com waits for pager idleness once while preserving explicit FS3 durability checkpoints.
 */
function progress(report) {
	if (report.filesSeen === 0 || report.filesSeen % 250 !== 0) return;
	process.stderr.write(
		`commentary recovery ${report.filesSeen} files, ${report.commentsWritten} comments, `
		+ `${report.outOfRange} out-of-range, ${report.missingPosts} missing posts\n`
	);
}

function saveReport(report) {
	const file = path.join(CANDIDATE_ROOT, "recovery-report.json");
	fs.writeFileSync(file, `${JSON.stringify(compactReport(report), null, 2)}\n`);
	return file;
}

function recoverSourceRoot({ sourceRoot, posts, writer, quarantine, report }) {
	for (const files of commentaryPostGroups(sourceRoot)) {
		recoverPostGroup({
			files,
			posts,
			writer,
			quarantine,
			report,
			onProgress: progress
		});
	}
}

function recoverAllSources({ posts, writer, quarantine, report }) {
	writer.runRecoveryBatch(() => {
		for (const sourceRoot of SOURCE_ROOTS) {
			recoverSourceRoot({ sourceRoot, posts, writer, quarantine, report });
		}
	});
}

function build() {
	prepareCandidate();
	const report = createReport();
	const posts = new PostIndex();
	const writer = new CandidateWriter(CANDIDATE_ROOT);
	const quarantine = new QuarantineLedger(CANDIDATE_ROOT);
	try {
		recoverAllSources({ posts, writer, quarantine, report });
	} finally {
		writer.close();
		posts.close();
		quarantine.close();
	}
	report.quarantine = quarantine.summary();
	const reportFile = saveReport(report);
	const result = {
		success: true,
		candidateRoot: CANDIDATE_ROOT,
		reportFile,
		...compactReport(report)
	};
	console.log(JSON.stringify(result, null, 2));
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
	build,
	recoverAllSources,
	recoverSourceRoot
};
