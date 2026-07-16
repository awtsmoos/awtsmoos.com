// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LogicalFsInventory
 * @description
 * The Awtsmoos weighs FS3 by paths and revealed bytes, never by physical offsets.
 * This inventory is the recovery covenant for a source whose old body ranges may
 * overlap while its currently readable virtual files remain authoritative.
 */

const crypto = require('crypto');
const store = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/store.js');
const blobValue = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/api/fs/v3/blobValue.js');

function hashBytes(bytes) {
	return crypto.createHash('sha256').update(bytes).digest('hex');
}

function liveFiles(database) {
	const manifest = store.manifest(database);
	return Object.values(manifest.inodes)
		.filter(inode => inode?.type === 'file' && !inode.deleted)
		.sort((left, right) => String(left.path).localeCompare(String(right.path)));
}

function logicalInventory(database, onFile = null) {
	const tree = crypto.createHash('sha256');
	let files = 0;
	let bytes = 0;
	for (const inode of liveFiles(database)) {
		const body = blobValue.readDataRecord(database, inode);
		if (body.length !== Number(inode.size || 0)) {
			throw inventoryError(inode.path, inode.size, body.length);
		}
		const sha256 = hashBytes(body);
		tree.update(String(inode.path)).update('\0');
		tree.update(String(body.length)).update('\0');
		tree.update(sha256).update('\n');
		files++;
		bytes += body.length;
		if (onFile) onFile({ inode, body, sha256 });
	}
	return {
		files,
		bytes,
		treeSha256: tree.digest('hex')
	};
}

function inventoryError(filePath, expected, actual) {
	const error = new Error(
		`B"H logical FS3 length mismatch at ${filePath}: ${actual} !== ${expected}`
	);
	error.code = 'AWTSMOOS_LOGICAL_FS_LENGTH_MISMATCH';
	return error;
}

module.exports = {
	hashBytes,
	liveFiles,
	logicalInventory
};