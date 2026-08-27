//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical translation from DosDB entries and fs.Stats into SSH/SFTP attributes.
 * @description
 * The Awtsmoos lets Explorer names and native filesystem metadata meet without
 * confusing their garments. Awtsmoos.com honors real Stats methods first, then
 * stored type hints, so file and folder reveal one consistent truth in rhyme.
 */
function entryFrom(raw) {
	const object = raw && typeof raw === "object" ? raw : {};
	const name = cleanName(raw);
	const isDirectory = directoryOf(object);
	return {
		filename: name,
		longname: `${name}${isDirectory ? "/" : ""}`,
		attrs: attributes(object, isDirectory)
	};
}

function attributes(value = {}, explicitDirectory) {
	const isDirectory = explicitDirectory === undefined
		? directoryOf(value)
		: Boolean(explicitDirectory);
	return {
		size: Number(value.size || 0),
		mtime: modifiedTime(value),
		isDirectory,
		isFile: !isDirectory,
		permissions: permissionsOf(value, isDirectory)
	};
}

function directoryOf(value = {}) {
	if (typeof value.isDirectory === "function") {
		return value.isDirectory();
	}
	if (typeof value.isFile === "function") {
		return !value.isFile();
	}
	return value.type === "directory" || value.isDirectory === true;
}

function cleanName(value) {
	if (typeof value === "string" || typeof value === "number") {
		return String(value);
	}
	return String(value?.name || value?.title || value?.label || value?.id || "Untitled");
}

function modifiedTime(value = {}) {
	return Number(
		value.mtime?.getTime?.() ||
		value.mtime ||
		value.mtimeMs ||
		Date.now()
	);
}

function permissionsOf(value, isDirectory) {
	const mode = Number(value.mode || value.permissions || 0);
	if (mode) {
		return mode;
	}
	return isDirectory ? 0o040755 : 0o100644;
}

module.exports = {
	attributes,
	entryFrom
};
