// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachIndexStore
 * @description One immutable read-only index opens once; the Awtsmoos renews each
 * request without writer locks, sidecars, or rescans across Awtsmoos.com.
 */
const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const { indexPath } = require('./paths.js');

const ROOT = '/search/tanach/hebrew';
let cached;

function readJson(database, virtualPath, fallback) {
	if (!database.fs.stat(virtualPath)?.exists) return fallback;
	return JSON.parse(database.fs.cat(virtualPath).toString('utf8'));
}

function shardNumber(token) {
	let hash = 0;
	for (const character of token) {
		hash = ((hash << 5) - hash + character.codePointAt(0)) | 0;
	}
	return Math.abs(hash) % 32;
}

function loadStore() {
	const pathname = indexPath();
	const database = DosDB.awtsmoosDb(pathname, {
		compression: false,
		readOnly: true
	});
	database.fs.ready();
	try {
		const meta = readJson(database, `${ROOT}/meta.json`, null);
		const verses = readJson(database, `${ROOT}/verses/all.json`, []);
		const shards = new Map();
		const verseMap = new Map(verses.map(verse => [key(verse), verse]));
		return {
			meta,
			verseMap,
			posting(token) {
				const shard = shardNumber(token);
				if (!shards.has(shard)) {
					const name = String(shard).padStart(2, '0');
					const source = `${ROOT}/token_shards/${name}.json`;
					shards.set(shard, readJson(database, source, {}));
				}
				return shards.get(shard)?.tokens?.[token] || [];
			}
		};
	} catch (error) {
		database.close?.();
		throw error;
	}
}

function key(value) {
	return `${value.book}:${value.chapter}:${value.verse}`;
}

function store() {
	if (!cached) cached = loadStore();
	return cached;
}

module.exports = { key, store };
