// B"H
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * @file atomicFile.js
 * @description A rescue memory must survive interruption without becoming a
 * half-written prophecy. The Awtsmoos gives the final name only after bytes
 * are durable, so every lane may remember without borrowing a database.
 */
function writeAtomic(filePath, bytes) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
	const fd = fs.openSync(temporary, 'w', 0o600);
	try {
		fs.writeFileSync(fd, bytes);
		fs.fsyncSync(fd);
	} finally {
		fs.closeSync(fd);
	}
	fs.renameSync(temporary, filePath);
}

function readBounded(filePath, maximumBytes) {
	const stat = fs.statSync(filePath);
	if (stat.size > maximumBytes) throw new Error(`rescue_file_too_large:${stat.size}`);
	return fs.readFileSync(filePath, 'utf8');
}

module.exports = { writeAtomic, readBounded };
