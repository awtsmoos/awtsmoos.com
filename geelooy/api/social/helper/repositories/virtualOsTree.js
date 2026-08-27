//B"H
// Boruch Hashem
// Blessed is He

const fs = require('fs');
const path = require('path');

/**
 * @module VirtualOsTree
 * @description
 * The Awtsmoos lets one checked-out Git tree enter hosted Virtual OS as bounded
 * source while Git objects remain private in the canonical bare repository.
 * Awtsmoos.com never imports `.git` internals into website/editor bytes.
 */

const MAX_FILES = 5000;
const MAX_BYTES = 64 * 1024 * 1024;

async function readWorkingTree(root) {
	const state = { files: 0, bytes: 0 };
	return readDirectory(root, state);
}

async function readDirectory(directory, state) {
	const result = {};
	const entries = await fs.promises.readdir(directory, { withFileTypes: true });
	for (const entry of entries) {
		if (entry.name === '.git') continue;
		const absolute = path.join(directory, entry.name);
		if (entry.isSymbolicLink()) throw treeError('GIT_IMPORT_SYMLINK_FORBIDDEN');
		if (entry.isDirectory()) {
			result[entry.name] = await readDirectory(absolute, state);
			continue;
		}
		if (!entry.isFile()) continue;
		const body = await fs.promises.readFile(absolute);
		state.files += 1;
		state.bytes += body.length;
		if (state.files > MAX_FILES || state.bytes > MAX_BYTES) {
			throw treeError('GIT_IMPORT_LIMIT_EXCEEDED');
		}
		result[entry.name] = Buffer.from(body);
	}
	return result;
}

function treeError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	MAX_BYTES,
	MAX_FILES,
	readWorkingTree
};
