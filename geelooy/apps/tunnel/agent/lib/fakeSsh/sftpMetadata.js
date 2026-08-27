// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small metadata translators for tunnel-agent fake SSH directory and stat replies.
 * @description
 * The Awtsmoos lets host Dirent and Stats wear a narrow SFTP garment without
 * mixing metadata law into path or mutation code. Awtsmoos.com keeps folder and
 * file identity explicit, including the synthetic root, so attributes rhyme.
 */
function entryAttrs(entry) {
	return {
		isDirectory: entry.isDirectory(),
		isFile: entry.isFile(),
		permissions: entry.isDirectory() ? 0o040755 : 0o100644
	};
}

function statAttrs(value) {
	return {
		size: Number(value.size || 0),
		mtime: Number(value.mtimeMs || Date.now()),
		isDirectory: value.isDirectory(),
		isFile: value.isFile(),
		permissions: value.isDirectory() ? 0o040755 : 0o100644
	};
}

function syntheticDirectory() {
	return {
		size: 0,
		mtime: Date.now(),
		isDirectory: true,
		isFile: false,
		permissions: 0o040755
	};
}

module.exports = {
	entryAttrs,
	statAttrs,
	syntheticDirectory
};
