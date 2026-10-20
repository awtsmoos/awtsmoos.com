//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module MeluketMapDb
 * @description State owner for the meluket map AwtsmoosDB handles and map reads (split from meluketMap.js, verbatim).
 */

const fs = require('fs');
const path = require('path');

const dbHandles = new Map();

function importedDbFile() {
	try {
		const { resolveSocialShardRoot } = require('../../awtsmoosDb/shardRoot.js');
		return path.join(path.dirname(resolveSocialShardRoot()), 'imported-comments.awtsmoosdb');
	} catch {
		return null;
	}
}

function dbForRead() {
	const file = importedDbFile();
	if (!file || !fs.existsSync(file)) return null;
	let mark = null;
	try {
		const status = fs.statSync(file);
		mark = `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
	} catch {
		return null;
	}
	const current = dbHandles.get(file);
	if (current && current.mark === mark) return current.database;
	try { current?.database?.close(); } catch {}
	let database = null;
	try {
		const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
		database = new AwtsmoosDB(file, {
			readOnly: true,
			readonly: true,
			wal: false,
			processLockMode: 'shared',
			lockMode: 'shared'
		});
		database.open();
	} catch {
		return null;
	}
	dbHandles.set(file, { database, mark });
	return database;
}

function dbReadMap() {
	const database = dbForRead();
	if (!database) return null;
	try {
		const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
		const target = '/meluket-post-map.v1.awtsmoosJSON';
		const stat = database.fs.stat(target);
		if (!stat || !stat.exists || stat.type !== 'file' || !stat.size) return null;
		return awts.deserializeBinary(database.fs.readRange(target, 0, stat.size));
	} catch {
		return null;
	}
}

module.exports = {
	importedDbFile,
	dbForRead,
	dbReadMap,
};
