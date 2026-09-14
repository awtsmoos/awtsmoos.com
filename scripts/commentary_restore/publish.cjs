//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");
const {
	ALIAS_FILE,
	RICH_FILE,
	packedFile
} = require("./candidate.cjs");
const { CANDIDATE_ROOT, LIVE_ROOT } = require("./config.cjs");
const { verifyCandidate } = require("./verify.cjs");

/**
 * @file Rollback-safe activation for verified commentary candidate stores.
 * @description Both native stores are staged beside live files and restored from backup on any failed activation proof.
 */
const FILES = [RICH_FILE, ALIAS_FILE];

function backupRoot() {
	return path.join(
		process.env.HOME,
		`Work/.ai-preserve/torah-commentary-backup-${Date.now()}`
	);
}
function stageFiles() {
	const folder = path.join(LIVE_ROOT, "socialPacked");
	fs.mkdirSync(folder, { recursive: true });
	const staged = new Map();
	for (const name of FILES) {
		const source = packedFile(CANDIDATE_ROOT, name);
		const target = path.join(folder, `.${name}.commentary-candidate-${process.pid}`);
		fs.copyFileSync(source, target);
		staged.set(name, target);
	}
	return staged;
}

function saveBackup(root) {
	fs.mkdirSync(root, { recursive: true });
	for (const name of FILES) {
		const live = packedFile(LIVE_ROOT, name);
		if (fs.existsSync(live)) fs.copyFileSync(live, path.join(root, name));
	}
}

function restoreBackup(root) {
	for (const name of FILES) {
		const live = packedFile(LIVE_ROOT, name);
		const saved = path.join(root, name);
		if (fs.existsSync(saved)) fs.copyFileSync(saved, live);
		else fs.rmSync(live, { force: true });
	}
}
function activateStaged(staged) {
	for (const name of FILES) {
		fs.renameSync(staged.get(name), packedFile(LIVE_ROOT, name));
	}
}

function publish() {
	const candidate = verifyCandidate(CANDIDATE_ROOT);
	if (!candidate.success) {
		throw new Error(`COMMENTARY_CANDIDATE_INVALID:${JSON.stringify(candidate.failures.slice(0, 5))}`);
	}
	const backup = backupRoot();
	const staged = stageFiles();
	saveBackup(backup);
	try {
		activateStaged(staged);
		const live = verifyCandidate(LIVE_ROOT);
		if (!live.success || live.count !== candidate.count) {
			throw new Error(`COMMENTARY_LIVE_VERIFY_FAILED:${live.count}:${live.failures.length}`);
		}
		return { success: true, count: live.count, backup };
	} catch (error) {
		restoreBackup(backup);
		throw error;
	} finally {
		for (const file of staged.values()) fs.rmSync(file, { force: true });
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

module.exports = { publish };
