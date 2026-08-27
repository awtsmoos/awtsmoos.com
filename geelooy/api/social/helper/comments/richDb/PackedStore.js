// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentPackedStore
 * @description
 * The Awtsmoos gives modern native comments their own small persistent vessel.
 * No rich-comment read or write can awaken the historical giant comments store.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const FILE = 'social.richComments.v1.fs.awtsdb';
const cache = new Map();

function dbRoot($i) {
	return $i?.db?.directory || $i?.db?.root || process.cwd();
}

function dbFile($i) {
	return path.join(dbRoot($i), 'socialPacked', FILE);
}

function fingerprint(file) {
	if (!fs.existsSync(file)) return 'missing';
	const status = fs.statSync(file);
	return `${status.dev}:${status.ino}`;
}

function open($i) {
	const file = dbFile($i);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const mark = fingerprint(file);
	const current = cache.get(file);
	if (current?.mark === mark) return current.db;
	try { current?.db?.close(); } catch {}
	const db = new AwtsmoosDB(file, {
		debug: false,
		readOnly: false,
		reuseFreedSpace: 'verified',
		versions: false,
		virtualFsCompression: true,
		wal: false,
		processLockMode: 'exclusive',
		lockMode: 'exclusive'
	});
	db.open();
	cache.set(file, { db, mark: fingerprint(file) });
	return db;
}

function read($i, target, fallback = null) {
	const db = open($i);
	const status = db.fs.stat(target);
	if (!status?.exists || status.type !== 'file') return fallback;
	return awts.deserializeBinary(db.fs.readRange(target, 0, status.size));
}

function write($i, target, value) {
	const db = open($i);
	const binary = Array.isArray(value)
		? awts.serializeArray(value)
		: awts.serializeJSON(value ?? {});
	db.fs.write(target, binary);
	db.fs.flush?.();
	return value;
}

function remove($i, target) {
	const db = open($i);
	const status = db.fs.stat(target);
	if (!status?.exists) return false;
	const result = db.fs.rm(target, { recursive: true });
	db.fs.flush?.();
	return result;
}

function closeAll() {
	for (const entry of cache.values()) try { entry.db.close(); } catch {}
	cache.clear();
}

process.once('exit', closeAll);

module.exports = { FILE, closeAll, dbFile, open, read, remove, write };
