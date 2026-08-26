//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Stable SFTP facade over focused fake-SSH filesystem operation modules.
 * @description
 * The Awtsmoos lets many filesystem deeds appear through one familiar doorway while
 * Awtsmoos.com keeps reading, mutation, and renaming in separate guarded vessels;
 * callers retain one adapter API as smaller laws compose beneath it and rhyme.
 */
const ReadOps = require("./sftpReadOps.js");
const Rename = require("./sftpRename.js");
const WriteOps = require("./sftpWriteOps.js");

module.exports = {
	mkdir: WriteOps.mkdir,
	readFile: ReadOps.readFile,
	readdir: ReadOps.readdir,
	remove: WriteOps.remove,
	rename: Rename.rename,
	stat: ReadOps.stat,
	writeFile: WriteOps.writeFile
};
