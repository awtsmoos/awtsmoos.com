// B"H

/**
 * @file core/vacuum/fileEvidence.js
 * @chapter The Source Is Witnessed Before And After The Crossing
 * @description
 * Captures immutable filesystem evidence and streams SHA-256 without loading a
 * production database file into memory.
 */

const crypto = require('crypto');
const fs = require('fs');

function sha256File(filePath) {
	const hash = crypto.createHash('sha256');
	const fd = fs.openSync(filePath, 'r');
	const buffer = Buffer.allocUnsafe(1024 * 1024);
	let offset = 0;
	try {
		while (true) {
			const read = fs.readSync(fd, buffer, 0, buffer.length, offset);
			if (read <= 0) break;
			hash.update(buffer.subarray(0, read));
			offset += read;
		}
	} finally {
		fs.closeSync(fd);
	}
	return hash.digest('hex');
}

function captureFileEvidence(filePath) {
	const stat = fs.statSync(filePath, { bigint: true });
	return {
		path: filePath,
		size: Number(stat.size),
		mtimeNs: stat.mtimeNs.toString(),
		inode: stat.ino.toString(),
		sha256: sha256File(filePath)
	};
}

module.exports = {
	captureFileEvidence,
	sha256File
};
