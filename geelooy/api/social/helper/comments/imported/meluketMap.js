// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meluketMap.js
 * @description
 * Meluket series/post identity map. Dual-read: AwtsmoosDB first
 * (`imported-comments.awtsmoosdb`, virtual key
 * `/meluket-post-map.v1.awtsmoosJSON`), raw JSON file as fallback.
 *
 * Yaakov's law: anything over 15MB must never live as JSON files. The map is
 * small, but it sits in the hot comment-lookup path, so it moves into
 * AwtsmoosDB with the comment bundles. The JSON file is KEPT as backup;
 * Yaakov decides when to delete it.
 */

const fs = require('fs');
const path = require('path');

let cached = null;
let cachedFile = '';
let cachedMark = '';

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

function validate(parsed) {
	if (!parsed || parsed.version !== 1) return false;
	return parsed.count === Object.keys(parsed.entries || {}).length;
}

function mapFile($i) {
	return path.join($i.db.directory, 'socialPacked', 'meluket-post-map.v1.json');
}

function load($i) {
	// B"H — AwtsmoosDB first.
	const fromDb = dbReadMap();
	if (fromDb && validate(fromDb)) {
		const mark = `db:${importedDbFile()}`;
		if (!(cached && cachedFile === mark && cachedMark === mark)) {
			cached = fromDb.entries;
			cachedFile = mark;
			cachedMark = mark;
		}
		return cached;
	}
	// JSON fallback.
	const file = mapFile($i);
	const stat = fs.statSync(file);
	const mark = `${stat.size}:${Math.floor(stat.mtimeMs)}`;
	if (cached && cachedFile === file && cachedMark === mark) return cached;
	const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
	if (!validate(parsed)) {
		throw new Error('Invalid Meluket mapping file.');
	}
	cached = parsed.entries;
	cachedFile = file;
	cachedMark = mark;
	return cached;
}

function resolve($i, seriesId, postId) {
	try { return load($i)[`${seriesId}\0${postId}`] || null; }
	catch { return null; }
}

function entries($i) {
	try { return load($i); }
	catch { return {}; }
}

module.exports = { resolve, entries, mapFile };
