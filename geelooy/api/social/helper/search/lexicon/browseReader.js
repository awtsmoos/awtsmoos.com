// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconBrowseReader
 * @description
 * The Awtsmoos opens one first-letter AwtsmoosDB shard, gathers only one requested page or sparse anchor set, then closes;
 * Awtsmoos.com therefore lets lexical oceans remain on disk while old and new generations both reveal bounded testimony.
 */

const fs = require('fs/promises');
const path = require('path');
const AwtsmoosDB = require(path.resolve(__dirname, '../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js'));
const { lexiconShardPath } = require('./paths.js');

const READ_OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });
const RANGE_END = '\uffff';

/** Resolves a lazy AwtsmoosDB value without widening the serving memory vessel. */
function resolveValue(value) {
	return value && typeof value.__resolve__ === 'function' ? value.__resolve__() : value;
}

/** Opens one validated source/letter shard or returns null when that shard is absent. */
async function openShard(catalog, sourceId, token) {
	const file = lexiconShardPath(catalog.root, sourceId, token);
	try {
		await fs.access(file);
	} catch (error) {
		if (error?.code === 'ENOENT') return null;
		throw error;
	}
	const database = new AwtsmoosDB(file, READ_OPTIONS);
	await database.open();
	return database;
}

/** Reads at most `maximum` rows strictly after a lower key from one native shard. */
async function readShardRows(catalog, sourceId, token, lowerKey = '', maximum = 21) {
	const database = await openShard(catalog, sourceId, token);
	if (!database) return [];
	const rows = [];
	try {
		if (!database.root.entries) return rows;
		for await (const row of database.range(database.root.entries, lowerKey || '', RANGE_END)) {
			const key = String(row?.key || '');
			if (lowerKey && key <= lowerKey) continue;
			const entry = resolveValue(row?.value);
			if (!entry) continue;
			rows.push({ ...entry, key, sourceId, token });
			if (rows.length >= maximum) break;
		}
		return rows;
	} finally {
		await database.close();
	}
}

/** Reads persisted sparse anchors when present, otherwise derives a tiny bounded list by streaming one letter shard. */
async function readShardAnchors(catalog, sourceId, token, stride = 64) {
	const database = await openShard(catalog, sourceId, token);
	if (!database) return [];
	try {
		if (database.root.anchors) return readStoredAnchors(database);
		return deriveAnchors(database, stride);
	} finally {
		await database.close();
	}
}

/** Collects the already-sparse anchor map without opening lexical payloads beyond those anchor values. */
async function readStoredAnchors(database) {
	const anchors = [];
	for await (const row of database.range(database.root.anchors, '', RANGE_END)) {
		const anchor = resolveValue(row?.value);
		if (anchor) anchors.push(anchor);
		if (anchors.length >= 64) break;
	}
	return anchors;
}

/** Streams one legacy letter shard and retains only every Nth lexical witness as a compatibility anchor. */
async function deriveAnchors(database, stride) {
	const anchors = [];
	let index = 0;
	if (!database.root.entries) return anchors;
	for await (const row of database.range(database.root.entries, '', RANGE_END)) {
		if (index % Math.max(1, Number(stride) || 64) === 0) {
			const entry = resolveValue(row?.value);
			if (entry) anchors.push({ key: String(row?.key || ''), headword: entry.headword, normalized: entry.normalized });
			if (anchors.length >= 64) break;
		}
		index += 1;
	}
	return anchors;
}

module.exports = {
	readShardAnchors,
	readShardRows
};
