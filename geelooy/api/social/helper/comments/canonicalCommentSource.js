// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module CanonicalCommentSource
 * @description
 * Reads the one authoritative compressed FS3 comments family before any derived
 * fallback. Handles are shared read-only and reopen only after an atomic inode swap.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const {
	allRows,
	names,
	rowsForSection
} = require('./commentReadUtils.js');

const cache = new Map();

function databasePath(context) {
	const root = context.$i?.db?.directory;
	if (!root || !context.heichelId) return null;
	return path.join(
		root,
		'socialPacked',
		`social.heichel.${context.heichelId}.comments.fs.awtsdb`
	);
}

function fingerprint(file) {
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}`;
}

function databaseFor(context) {
	const file = databasePath(context);
	if (!file || !fs.existsSync(file)) return null;
	const mark = fingerprint(file);
	const current = cache.get(file);
	if (current?.mark === mark) return current.database;
	try { current?.database?.close(); } catch {}
	const database = new AwtsmoosDB(file, {
		readOnly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	cache.set(file, { database, mark });
	return database;
}

function virtualFile(filePath) {
	return filePath.endsWith('.awtsmoosJSON')
		? filePath
		: `${filePath}.awtsmoosJSON`;
}

function readObject(context, filePath) {
	const database = databaseFor(context);
	if (!database) return null;
	try {
		const target = virtualFile(filePath);
		const status = database.fs.stat(target);
		if (!status?.exists || status.type !== 'file' || !status.size) return null;
		return awts.deserializeBinary(database.fs.readRange(target, 0, status.size));
	} catch {
		return null;
	}
}

function readVerse(context, filePath, verseSection) {
	return rowsForSection(readObject(context, filePath), verseSection);
}

function readAll(context, filePath) {
	return allRows(readObject(context, filePath));
}

function readSections(context, filePath) {
	return names(readObject(context, filePath));
}

function readAuthors(context, basePath, verseSection) {
	const database = databaseFor(context);
	if (!database) return [];
	let aliases;
	try { aliases = names(database.fs.ls(basePath)); } catch { return []; }
	return aliases.filter(aliasId => {
		const aliasPath = `${basePath}/${aliasId}`;
		if (verseSection === undefined) {
			return readSections({ ...context, aliasId }, aliasPath).length > 0;
		}
		return readVerse({ ...context, aliasId }, aliasPath, verseSection).length > 0;
	});
}

function closeAll() {
	for (const entry of cache.values()) {
		try { entry.database.close(); } catch {}
	}
	cache.clear();
}

process.once('exit', closeAll);

module.exports = {
	closeAll,
	databasePath,
	readAll,
	readAuthors,
	readObject,
	readSections,
	readVerse
};