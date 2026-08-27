// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RagPackedCommentRows
 * @description
 * Opens the authoritative packed comment vessel once and reads only a known alias
 * object. The Awtsmoos bypasses costly directory wandering, while Awtsmoos.com
 * adds no shard, vector, sidecar, WAL, or persistent lookup structure.
 */

const fs = require('fs');
const path = require('path');
const DB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const { getAliasCommentFilePath } = require('../../comments/commentPaths.js');
const {
	flattenLegacy,
	normalizeComment
} = require('./commentRowShape.js');

const DATABASES = new Map();
const ROWS = new Map();
const MAX_ROW_CACHE = 128;
function pathContext(context) {
	return {
		...context,
		parentId: context.parentId || context.postId,
		parentType: context.parentType || 'post'
	};
}

function packedDatabaseFile(context) {
	const root = context.$i?.db?.directory;
	if (!root || !context.heichelId) return null;
	return path.join(
		root,
		'socialPacked',
		`social.heichel.${context.heichelId}.comments.fs.awtsdb`
	);
}

function packedVirtualPath(context) {
	return getAliasCommentFilePath(pathContext(context)) || null;
}

function openDatabase(file) {
	if (DATABASES.has(file)) return DATABASES.get(file);
	if (!file || !fs.existsSync(file)) return null;
	const database = new DB(file, {
		compression: false,
		readOnly: true,
		readonly: true,
		wal: false,
		processLockMode: 'shared',
		lockMode: 'shared'
	});
	database.open();
	DATABASES.set(file, database);
	return database;
}

function readPackedValue(database, virtualPath) {
	const stat = database?.fs?.stat(virtualPath);
	if (!stat?.exists || stat.type !== 'file' || !stat.size) return null;
	return awts.deserializeBinary(
		database.fs.readRange(virtualPath, 0, stat.size)
	);
}

function rowsFromPackedValue(value, context) {
	return flattenLegacy(value)
		.map(row => normalizeComment(row, { ...context, imported: true }))
		.filter(Boolean)
		.map(row => ({ ...row, ragCommentSource: 'packedAwtsmoosDbDirect' }));
}

function remember(key, rows) {
	if (ROWS.has(key)) ROWS.delete(key);
	ROWS.set(key, rows);
	while (ROWS.size > MAX_ROW_CACHE) ROWS.delete(ROWS.keys().next().value);
	return rows;
}

function packedRows(context) {
	if (!context.aliasId) return [];
	const file = packedDatabaseFile(context);
	const virtualPath = packedVirtualPath(context);
	if (!file || !virtualPath) return [];
	const key = `${file}\u0000${virtualPath}`;
	if (ROWS.has(key)) return remember(key, ROWS.get(key));
	try {
		return remember(
			key,
			rowsFromPackedValue(readPackedValue(openDatabase(file), virtualPath), context)
		);
	} catch {
		return [];
	}
}

process.once('exit', () => {
	for (const database of DATABASES.values()) {
		try { database.pager?.close?.(); } catch {}
		try { database.processLock?.release?.(); } catch {}
	}
});

module.exports = {
	packedDatabaseFile,
	packedRows,
	packedVirtualPath,
	pathContext,
	rowsFromPackedValue
};
