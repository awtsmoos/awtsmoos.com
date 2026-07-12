// B"H

/**
 * @file api/admin/sidecars.js
 * @chapter The Main Vessel Is Not Alone In The Night
 * @description
 * Reports WAL, writer-lock, and reader-marker state without creating or removing
 * any sidecar.
 */

const fs = require('fs');
const path = require('path');

function fileState(filePath) {
	if (!fs.existsSync(filePath)) return { exists: false, bytes: 0 };
	return { exists: true, bytes: fs.statSync(filePath).size };
}

function readerState(directory) {
	if (!fs.existsSync(directory)) return { exists: false, markers: 0 };
	let markers = 0;
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		if (entry.isFile() && path.extname(entry.name) === '.lock') markers++;
	}
	return { exists: true, markers };
}

function inspectSidecars(databasePath) {
	return {
		wal: fileState(`${databasePath}.wal`),
		writerLock: fileState(`${databasePath}.lock`),
		readers: readerState(`${databasePath}.readers`)
	};
}

module.exports = inspectSidecars;
