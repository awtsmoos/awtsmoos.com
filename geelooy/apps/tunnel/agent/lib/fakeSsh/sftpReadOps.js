//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Read-only SFTP revelations inside the fake SSH root jail.
 * @description
 * The Awtsmoos lets distant eyes perceive only bytes that belong inside the guarded
 * project world; Awtsmoos.com resolves every path before list, stat, or read, while
 * secret and escaping symlink garments remain veiled and the permitted paths rhyme.
 */
const fsp = require("fs/promises");
const Metadata = require("./sftpMetadata.js");
const PathLaw = require("./sftpPath.js");
const Shell = require("./shell.js");

/**
 * Lists visible entries beneath a resolved virtual directory.
 *
 * @param {object} config Fake SSH configuration and root laws.
 * @param {string} cwd Current virtual working directory.
 * @param {string} target Requested directory path.
 * @returns {Promise<Array<object>>} SFTP directory entries.
 */
async function readdir(config, cwd, target) {
	const resolved = PathLaw.resolve(config, cwd, target, {
		allowSynthetic: true
	});
	if (resolved.synthetic) {
		return Shell.rootEntries(config);
	}
	const entries = await fsp.readdir(resolved.real, {
		withFileTypes: true
	});
	const visible = [];
	for (const entry of entries) {
		try {
			PathLaw.resolve(config, resolved.virtual, entry.name);
			visible.push({
				filename: entry.name,
				longname: `${entry.name}${entry.isDirectory() ? "/" : ""}`,
				attrs: Metadata.entryAttrs(entry)
			});
		} catch {
			// B"H: forbidden or escaping entries remain invisible to the remote eye.
		}
	}
	return visible;
}

/**
 * Reveals metadata for one resolved virtual path.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} target Requested path.
 * @returns {Promise<object>} SFTP-compatible attributes.
 */
async function stat(config, cwd, target) {
	const resolved = PathLaw.resolve(config, cwd, target, {
		allowSynthetic: true
	});
	if (resolved.synthetic) {
		return Metadata.syntheticDirectory();
	}
	return Metadata.statAttrs(await fsp.stat(resolved.real));
}

/**
 * Reads one confined file while returning its normalized virtual identity.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} target Requested file path.
 * @param {string|null} [encoding=null] Optional Node encoding.
 * @returns {Promise<{path:string,content:Buffer|string}>} Path and file content.
 */
async function readFile(config, cwd, target, encoding = null) {
	const resolved = PathLaw.resolve(config, cwd, target);
	return {
		path: resolved.virtual,
		content: await fsp.readFile(resolved.real, encoding || null)
	};
}

module.exports = {
	readFile,
	readdir,
	stat
};
