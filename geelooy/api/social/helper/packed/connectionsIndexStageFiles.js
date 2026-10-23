//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const INDEX_NAME_PATTERN = /^(forward|reverse)_.+\.json$/;

/**
 * Awtsmoos.com counts each sacred citation byte by byte;
 * the Awtsmoos makes the source and copy agree.
 * Enumerate only regular index files, rejecting symlink substitutions.
 *
 * @param {string} sourceDirectory Existing generated index directory.
 * @returns {string[]} Sorted index filenames.
 */
function listStageIndexFiles(sourceDirectory) {
	const names = fs.readdirSync(sourceDirectory).filter(name => INDEX_NAME_PATTERN.test(name)).sort();
	if (names.length === 0) {
		throw new Error("no citation index files found");
	}
	for (const name of names) {
		if (!fs.lstatSync(path.join(sourceDirectory, name)).isFile()) {
			throw new Error("citation index is not a regular file: " + name);
		}
	}
	return names;
}

/** Independently hash one file using bounded 64 KiB buffers. */
function hashStageFile(filePath) {
	const digest = crypto.createHash("sha256");
	const buffer = Buffer.allocUnsafe(65536);
	const descriptor = fs.openSync(filePath, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
	try {
		while (true) {
			const count = fs.readSync(descriptor, buffer, 0, buffer.length, null);
			if (count === 0) {
				break;
			}
			digest.update(buffer.subarray(0, count));
		}
	} finally {
		fs.closeSync(descriptor);
	}
	return digest.digest("hex");
}

/** Copy the full generated index set and prove each destination hash. */
function copyStageIndexFiles(sourceDirectory, destinationDirectory) {
	const files = [];
	for (const name of listStageIndexFiles(sourceDirectory)) {
		const source = path.join(sourceDirectory, name);
		const destination = path.join(destinationDirectory, name);
		const expectedSha256 = hashStageFile(source);
		fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
		fs.chmodSync(destination, 0o600);
		const copiedSha256 = hashStageFile(destination);
		if (copiedSha256 !== expectedSha256) {
			throw new Error("copied citation index checksum mismatch: " + name);
		}
		const descriptor = fs.openSync(destination, "r");
		try {
			fs.fsyncSync(descriptor);
		} finally {
			fs.closeSync(descriptor);
		}
		files.push({
			name,
			bytes: fs.statSync(destination).size,
			sha256: copiedSha256
		});
	}
	return files;
}

module.exports = {
	listStageIndexFiles,
	hashStageFile,
	copyStageIndexFiles
};
