//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded write, directory creation, and removal laws for fake SSH SFTP.
 * @description
 * The Awtsmoos grants change only through explicit permission and measured bytes;
 * Awtsmoos.com keeps every mutation root-jailed, refuses non-empty directory erasure,
 * and lets creation or removal alter only the intended vessel while safeguards rhyme.
 */
const fsp = require("fs/promises");
const path = require("path");
const PathLaw = require("./sftpPath.js");

/**
 * Writes bounded content to a confined path, creating parent directories as needed.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} target Requested file path.
 * @param {Buffer|string} content New file content.
 * @returns {Promise<{path:string,bytes:number}>} Normalized path and byte count.
 */
async function writeFile(config, cwd, target, content) {
	PathLaw.requireWrite(config);
	const bytes = PathLaw.assertWriteSize(content);
	const resolved = PathLaw.resolve(config, cwd, target);
	await fsp.mkdir(path.dirname(resolved.real), {
		recursive: true
	});
	await fsp.writeFile(resolved.real, content);
	return {
		path: resolved.virtual,
		bytes
	};
}

/**
 * Creates one confined directory after write permission is proven.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} target Requested directory path.
 * @returns {Promise<{path:string}>} Created virtual path.
 */
async function mkdir(config, cwd, target) {
	PathLaw.requireWrite(config);
	const resolved = PathLaw.resolve(config, cwd, target);
	await fsp.mkdir(resolved.real);
	return {
		path: resolved.virtual
	};
}

/**
 * Removes one file or one empty directory, never a populated directory tree.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} target Requested path.
 * @returns {Promise<{path:string}>} Removed virtual path.
 */
async function remove(config, cwd, target) {
	PathLaw.requireWrite(config);
	const resolved = PathLaw.resolve(config, cwd, target);
	const attrs = await fsp.stat(resolved.real);
	if (attrs.isDirectory()) {
		await removeEmptyDirectory(resolved.real);
	} else {
		await fsp.unlink(resolved.real);
	}
	return {
		path: resolved.virtual
	};
}

/**
 * Removes a directory only after proving that no child entries remain.
 *
 * @param {string} realPath Confined real filesystem path.
 * @returns {Promise<void>} Completion promise.
 */
async function removeEmptyDirectory(realPath) {
	const entries = await fsp.readdir(realPath);
	if (entries.length) {
		throw new Error("fake_ssh_directory_not_empty");
	}
	await fsp.rmdir(realPath);
}

module.exports = {
	mkdir,
	remove,
	writeFile
};
