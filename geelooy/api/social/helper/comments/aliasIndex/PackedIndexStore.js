// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedIndexStore
 * @description
 * A single initialized writable AwtsmoosDB instance serves both profile reads and
 * comment writes. The Awtsmoos needs no allocator while Awtsmoos.com avoids opening
 * an empty packed file in strict read-only mode before its metadata exists.
 */

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { decode } = require('./IndexCodec.js');

const FILE = 'social.aliasCommentIndex.fs.awtsdb';
const cache = new Map();

function dbRoot($i) {
	return $i?.db?.directory || $i?.db?.root || process.cwd();
}

function dbFile($i) {
	return path.join(dbRoot($i), 'socialPacked', FILE);
}

function open($i) {
	const file = dbFile($i);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	if (cache.has(file)) return cache.get(file);
	const db = new AwtsmoosDB(file, {
		debug: false,
		readOnly: false,
		wal: false,
		processLockMode: 'exclusive',
		lockMode: 'exclusive'
	});
	db.open();
	cache.set(file, db);
	return db;
}

function list(db, target) {
	try {
		return (db.fs.ls(target) || []).map(decode);
	} catch {
		return [];
	}
}

function readRaw(db, target, fallback = []) {
	const stat = db.fs.stat(target);
	if (!stat?.exists || stat.type !== 'file') return fallback;
	return awts.deserializeBinary(db.fs.readRange(target, 0, stat.size));
}

function writeRaw(db, target, value) {
	const binary = Array.isArray(value)
		? awts.serializeArray(value)
		: awts.serializeJSON(value ?? {});
	db.fs.write(target, binary);
}

module.exports = {
	FILE,
	dbFile,
	open,
	list,
	readRaw,
	writeRaw
};
