//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const {
	aliasWitness,
	fileSha256,
	sameWitness
} = require("./authorityHash.cjs");
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
 * @description The Awtsmoos admits proven rich-comment authority only while Awtsmoos.com proves social alias identity stayed byte-exact.
 */
function backupRoot() {
	return path.join(
		process.env.HOME,
		`Work/.ai-preserve/torah-commentary-backup-${Date.now()}`
	);
}

/** Requires native structure and exact bytes to survive activation. */
function verifyLive(candidate, candidateSha256, liveFile) {
	const live = verifyCandidate(LIVE_ROOT);
	const liveSha256 = fileSha256(liveFile);
	if (!live.success || live.count !== candidate.count) {
		throw new Error(`COMMENTARY_LIVE_VERIFY_FAILED:${live.count}:${live.failures.length}`);
	}
	if (liveSha256 !== candidateSha256) {
		throw new Error(`COMMENTARY_LIVE_HASH_MISMATCH:${candidateSha256}:${liveSha256}`);
	}
	return { live, liveSha256 };
}

function publish() {
	const candidate = verifyCandidate(CANDIDATE_ROOT);
	if (!candidate.success) {
		throw new Error(`COMMENTARY_CANDIDATE_INVALID:${JSON.stringify(candidate.failures.slice(0, 5))}`);
	}
	const candidateFile = packedFile(CANDIDATE_ROOT, RICH_FILE);
	const liveFile = packedFile(LIVE_ROOT, RICH_FILE);
	const candidateSha256 = fileSha256(candidateFile);
	const aliasBefore = aliasWitness(LIVE_ROOT);
	const backup = backupRoot();
	const staged = stageFile(candidateFile, liveFile);
	const saved = saveBackup(liveFile, backup);
	const backupSha256 = saved ? fileSha256(saved) : null;
	try {
		activateStaged(staged, liveFile);
		const verified = verifyLive(candidate, candidateSha256, liveFile);
		const aliasAfter = aliasWitness(LIVE_ROOT);
		if (!sameWitness(aliasBefore, aliasAfter)) {
			throw new Error(`SOCIAL_ALIAS_AUTHORITY_CHANGED:${aliasBefore.sha256}:${aliasAfter.sha256}`);
		}
		return {
			success: true,
			count: verified.live.count,
			backup,
			backupSha256,
			candidateSha256,
			liveSha256: verified.liveSha256,
			aliasSha256: aliasAfter.sha256,
			aliasBytes: aliasAfter.bytes,
			liveFile
		};
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
	publish,
	verifyLive
};
