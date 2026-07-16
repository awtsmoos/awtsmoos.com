// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RecoverySupport
 * @description Small, explicit vessels for recovery evidence, lifecycle, and files.
 */

const fs = require('fs');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

function openDatabase(file, readOnly) {
	const database = new AwtsmoosDB(file, {
		compression: false,
		processLockMode: readOnly ? 'shared' : 'exclusive',
		readOnly,
		reuseFreedSpace: readOnly ? false : 'verified',
		virtualFsCompression: true,
		wal: false
	});
	database.open();
	return database;
}

function closeDatabase(database) {
	try { database?.close(); } catch {}
}

function plain(database, value) {
	try { return database._plain(value); } catch { return value; }
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

function sameEvidence(left, right) {
	return left.sha256 === right.sha256
		&& left.size === right.size
		&& left.mtimeNs === right.mtimeNs
		&& left.inode === right.inode;
}

function sameInventory(left, right) {
	return left.files === right.files
		&& left.bytes === right.bytes
		&& left.treeSha256 === right.treeSha256;
}

function cleanupCandidate(file) {
	for (const suffix of ['', '.wal', '.lock', '.readers']) {
		fs.rmSync(`${file}${suffix}`, { recursive: true, force: true });
	}
}

function writeJson(file, value) {
	const temporary = `${file}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
	fs.renameSync(temporary, file);
}

function recoveryError(message, details) {
	return Object.assign(new Error(`B"H logical recovery refused: ${message}`), {
		code: 'AWTSMOOS_LOGICAL_RECOVERY_REFUSED',
		details
	});
}

module.exports = {
	cleanupCandidate,
	clone,
	closeDatabase,
	openDatabase,
	plain,
	recoveryError,
	sameEvidence,
	sameInventory,
	writeJson
};