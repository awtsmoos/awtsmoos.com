// B"H

/**
 * @file core/swap/durability.js
 * @chapter The Directory Itself Bears Witness To The Renamed World
 * @description
 * Flushes files and parent directories so completed rename stages survive an
 * ordinary crash boundary on filesystems that honor directory fsync.
 */

const fs = require('fs');
const path = require('path');

function fsyncFile(filePath) {
	const descriptor = fs.openSync(filePath, 'r');
	try {
		fs.fsyncSync(descriptor);
	} finally {
		fs.closeSync(descriptor);
	}
}

function fsyncDirectory(directoryPath) {
	let descriptor = null;
	try {
		descriptor = fs.openSync(directoryPath, 'r');
		fs.fsyncSync(descriptor);
	} catch (error) {
		if (!['EINVAL', 'ENOTSUP', 'EBADF'].includes(error.code)) throw error;
	} finally {
		if (descriptor !== null) fs.closeSync(descriptor);
	}
}

function fsyncPaths(paths) {
	const directories = new Set();
	for (const filePath of paths) {
		if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) fsyncFile(filePath);
		if (filePath) directories.add(path.dirname(filePath));
	}
	for (const directoryPath of directories) fsyncDirectory(directoryPath);
}

module.exports = {
	fsyncDirectory,
	fsyncFile,
	fsyncPaths
};
