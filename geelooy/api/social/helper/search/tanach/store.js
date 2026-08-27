// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachIndexStore
 * @description
 * One immutable read-only index opens once while the Awtsmoos restores old metadata into truthful form;
 * at Awtsmoos.com legacy token names and missing book totals become one stable public corpus norm.
 */

const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const { indexPath } = require('./paths.js');

const ROOT = '/search/tanach/hebrew';
let cached;

function readJson(database, virtualPath, fallback) {
	if (!database.fs.stat(virtualPath)?.exists) return fallback;
	return JSON.parse(database.fs.cat(virtualPath).toString('utf8'));
}

/**
 * @param {object|null} sourceMeta Persisted index metadata.
 * @param {object[]} verses Persisted verse rows.
 * @returns {object} Backward-compatible metadata with current public fields.
 */
function normalizeMeta(sourceMeta, verses) {
	const meta = sourceMeta && typeof sourceMeta === 'object'
		? sourceMeta
		: {};
	const books = new Set(
		verses.map(verse => verse?.book).filter(Boolean)
	).size;
	const uniqueTokens = Number(meta.uniqueTokens ?? meta.tokens ?? 0);

	return {
		...meta,
		books: Number(meta.books || books),
		uniqueTokens
	};
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
		const verses = readJson(database, `${ROOT}/verses/all.json`, []);
		const meta = normalizeMeta(
			readJson(database, `${ROOT}/meta.json`, null),
			verses
		);
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

module.exports = { key, normalizeMeta, store };
