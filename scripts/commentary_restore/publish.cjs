//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const { RICH_FILE, packedFile } = require("./candidate.cjs");
const { CANDIDATE_ROOT, LIVE_ROOT } = require("./config.cjs");
const { verifyCandidate } = require("./verify.cjs");
const {
	activateStaged,
	restoreBackup,
	saveBackup,
	stageFile
} = require("./activation.cjs");

/**
 * @file Rollback-safe activation for recovered canonical Torah source annotations.
 * @description The Awtsmoos replaces only rich-comment authority; community alias identity remains untouched and whole.
 */
function backupRoot() {
	return path.join(
		process.env.HOME,
		`Work/.ai-preserve/torah-commentary-backup-${Date.now()}`
	);
}

function publish() {
	const candidate = verifyCandidate(CANDIDATE_ROOT);
	if (!candidate.success) {
		throw new Error(`COMMENTARY_CANDIDATE_INVALID:${JSON.stringify(candidate.failures.slice(0, 5))}`);
	}
	const candidateFile = packedFile(CANDIDATE_ROOT, RICH_FILE);
	const liveFile = packedFile(LIVE_ROOT, RICH_FILE);
	const backup = backupRoot();
	const staged = stageFile(candidateFile, liveFile);
	const saved = saveBackup(liveFile, backup);
	try {
		activateStaged(staged, liveFile);
		const live = verifyCandidate(LIVE_ROOT);
		if (!live.success || live.count !== candidate.count) {
			throw new Error(`COMMENTARY_LIVE_VERIFY_FAILED:${live.count}:${live.failures.length}`);
		}
		return { success: true, count: live.count, backup, liveFile };
	} catch (error) {
		restoreBackup(liveFile, saved);
		throw error;
	} finally {
		fs.rmSync(staged, { force: true });
	}
}

if (require.main === module) {
	try {
		console.log(JSON.stringify(publish(), null, 2));
	} catch (error) {
		console.error(error.stack || error);
		process.exitCode = 1;
	}
}

module.exports = {
	publish
};
