//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Truthful directory-entry enrichment across modern and compatibility DosDB shapes.
 * @description
 * The Awtsmoos lets one directory reveal either rich metadata or only a child name;
 * Awtsmoos.com refuses to mistake a folder for a file merely because an older
 * database garment is sparse. Missing type light is recovered by bounded stat rhyme.
 */
const Entry = require("./aliasEntry.js");
const Path = require("./aliasPath.js");

/**
 * Converts a bounded DosDB directory result into truthful SFTP entries.
 *
 * Rich records pass directly through the mapper. Bare names are enriched through
 * the same access metadata DosDB exposes to Geelooy before their SFTP type is set.
 *
 * @param {object} session Verified virtual SSH session.
 * @param {string} parentVirtual Canonical virtual directory path.
 * @param {Array<*>} rawEntries DosDB directory result.
 * @returns {Promise<Array<object>>}
 * 	SFTP-shaped entries with trustworthy file/directory identity.
 */
async function fromRaw(session, parentVirtual, rawEntries) {
	return Promise.all(
		rawEntries.map(raw => enrichOne(session, parentVirtual, raw))
	);
}

async function enrichOne(session, parentVirtual, raw) {
	if (hasTypeMetadata(raw)) {
		return Entry.entryFrom(raw);
	}
	const name = String(raw);
	const childVirtual = Path.virtualPath(parentVirtual, name);
	const metadata = await session.db.read(
		Path.databasePath(session.aliasId, "/", childVirtual),
		{ access: true }
	);
	if (!metadata) {
		throw new Error(`virtual_path_not_found:${childVirtual}`);
	}
	return Entry.entryFrom({
		...metadata,
		name
	});
}

function hasTypeMetadata(raw) {
	if (!raw || typeof raw !== "object") {
		return false;
	}
	return typeof raw.isDirectory === "function" ||
		typeof raw.isFile === "function" ||
		raw.type === "directory" ||
		raw.type === "file" ||
		typeof raw.isDirectory === "boolean";
}

module.exports = {
	fromRaw
};
