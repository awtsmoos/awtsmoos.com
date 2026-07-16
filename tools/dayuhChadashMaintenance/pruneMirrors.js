// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PruneMirrors
 * @description
 * Removes raw files only after their SHA-256 equals the authoritative FS3 bytes.
 * Empty legacy comment markers may be removed separately after packed comments pass.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const blobValue = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/blobValue.js');
const { liveFiles } = require('./logicalInventory.js');

function hash(bytes) {
	return crypto.createHash('sha256').update(bytes).digest('hex');
}

function rawPath(dataRoot, virtualPath) {
	const target = path.resolve(dataRoot, String(virtualPath).replace(/^\/+/, ''));
	if (!target.startsWith(`${path.resolve(dataRoot)}${path.sep}`)) {
		throw new Error(`B"H mirror path escaped data root: ${virtualPath}`);
	}
	return target;
}

function matchingMirrors(databaseFile, dataRoot) {
	const database = new AwtsmoosDB(databaseFile, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared'
	});
	database.open();
	const matched = [];
	const mismatched = [];
	try {
		for (const inode of liveFiles(database)) {
			const file = rawPath(dataRoot, inode.path);
			if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
			const packed = blobValue.readDataRecord(database, inode);
			const raw = fs.readFileSync(file);
			const record = { file, path: inode.path, bytes: raw.length };
			if (raw.length === packed.length && hash(raw) === hash(packed)) {
				matched.push(record);
			} else {
				mismatched.push(record);
			}
		}
	} finally {
		database.close();
	}
	return { matched, mismatched };
}

function pruneMatchingMirrors(databaseFile, dataRoot, options = {}) {
	const audit = matchingMirrors(databaseFile, dataRoot);
	if (audit.mismatched.length) return { ...audit, removed: [], refused: true };
	const removed = [];
	if (options.dryRun !== true) {
		for (const record of audit.matched) {
			fs.unlinkSync(record.file);
			removed.push(record);
		}
		removeEmptyDirectories(path.join(dataRoot, 'social'));
	}
	return { ...audit, removed, refused: false };
}

function pruneEmptyLegacyComments(dataRoot, options = {}) {
	const root = path.join(dataRoot, 'social', 'heichelos', 'ikar', 'comments');
	if (!fs.existsSync(root)) return { files: 0, removed: false };
	const files = allFiles(root);
	const nonEmpty = files.filter(file => fs.statSync(file).size > 0);
	if (nonEmpty.length) {
		return { files: files.length, nonEmpty, removed: false, refused: true };
	}
	if (options.dryRun !== true) fs.rmSync(root, { recursive: true, force: true });
	return { files: files.length, removed: options.dryRun !== true, refused: false };
}

function allFiles(root) {
	const output = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const file = path.join(root, entry.name);
		if (entry.isDirectory()) output.push(...allFiles(file));
		else if (entry.isFile()) output.push(file);
	}
	return output;
}

function removeEmptyDirectories(root) {
	if (!fs.existsSync(root)) return;
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		if (entry.isDirectory()) removeEmptyDirectories(path.join(root, entry.name));
	}
	if (fs.readdirSync(root).length === 0) fs.rmdirSync(root);
}

module.exports = {
	matchingMirrors,
	pruneEmptyLegacyComments,
	pruneMatchingMirrors,
	rawPath
};