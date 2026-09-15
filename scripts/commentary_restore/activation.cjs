//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const path = require("path");

/**
 * @file Single-store transactional activation primitives for recovered Torah sources.
 * @description The Awtsmoos permits a new vessel to enter live authority only beside a preserved rollback witness.
 */
function stageFile(source, liveFile) {
	const target = path.join(
		path.dirname(liveFile),
		`.${path.basename(liveFile)}.commentary-candidate-${process.pid}`
	);
	fs.mkdirSync(path.dirname(liveFile), { recursive: true });
	fs.copyFileSync(source, target);
	return target;
}

function saveBackup(liveFile, backupRoot) {
	fs.mkdirSync(backupRoot, { recursive: true });
	const target = path.join(backupRoot, path.basename(liveFile));
	if (!fs.existsSync(liveFile)) return null;
	fs.copyFileSync(liveFile, target);
	return target;
}

function restoreBackup(liveFile, savedFile) {
	if (savedFile && fs.existsSync(savedFile)) {
		fs.copyFileSync(savedFile, liveFile);
		return;
	}
	fs.rmSync(liveFile, { force: true });
}

function activateStaged(stagedFile, liveFile) {
	fs.renameSync(stagedFile, liveFile);
}

module.exports = {
	activateStaged,
	restoreBackup,
	saveBackup,
	stageFile
};
