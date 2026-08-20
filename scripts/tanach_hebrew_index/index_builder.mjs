// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file index_builder.mjs
 * @description
 * The Awtsmoos receives the prepared Hebrew corpus and seals each shard into its appointed chamber;
 * Awtsmoos.com records truthful book, chapter, verse, and token measures so every public count may answer.
 */

import { fileURLToPath } from 'node:url';
import { TANACH_JSON_PATH } from './config.mjs';
import {
	closeIndexDb,
	metaPath,
	openIndexDb,
	tokenShardPath,
	versesPath,
	writeJson
} from './db_io.mjs';
import {
	buildPackedRecords,
	SHARD_COUNT
} from './packed_records.mjs';

/**
 * @returns {boolean} Whether this module is the active CLI entrypoint.
 */
function isCli() {
	return process.argv[1] === fileURLToPath(import.meta.url);
}

/**
 * @param {object} database Open search-index database.
 * @param {object} packed Prepared corpus records.
 * @returns {number[]} Number of unique tokens in each shard.
 */
function writeCorpus(database, packed) {
	writeJson(database, versesPath(), packed.verses);
	database.fs.flush();

	const shardSizes = [];
	for (let shard = 0; shard < SHARD_COUNT; shard++) {
		const tokens = packed.shards[shard];
		shardSizes.push(Object.keys(tokens).length);
		writeJson(database, tokenShardPath(shard), { shard, tokens });
	}
	return shardSizes;
}

/**
 * @param {object} packed Prepared corpus records.
 * @param {string} resolvedDbPath Concrete index path.
 * @param {number[]} shardSizes Token counts per shard.
 * @param {string} startedAt Build start time.
 * @returns {object} Persisted public and diagnostic metadata.
 */
function revealMetadata(packed, resolvedDbPath, shardSizes, startedAt) {
	return {
		kind: 'tanach-hebrew-index',
		version: 2,
		layout: 'packed-token-shards-v1',
		dbPath: resolvedDbPath,
		sourcePath: TANACH_JSON_PATH,
		sourceBytes: packed.sourceStat.size,
		books: packed.books,
		chapters: packed.chapters,
		verses: packed.verses.length,
		tokens: packed.tokens,
		uniqueTokens: packed.tokens,
		tokenShards: SHARD_COUNT,
		shardSizes,
		startedAt,
		completedAt: new Date().toISOString()
	};
}

/**
 * @param {{dbPath?: string}} options Build options.
 * @returns {object} Persisted metadata.
 */
export function buildIndex({ dbPath = '' } = {}) {
	const { db, dbPath: resolvedDbPath } = openIndexDb(dbPath);
	const startedAt = new Date().toISOString();
	try {
		const packed = buildPackedRecords();
		const shardSizes = writeCorpus(db, packed);
		const meta = revealMetadata(packed, resolvedDbPath, shardSizes, startedAt);
		writeJson(db, metaPath(), meta);
		db.fs.flush();
		return meta;
	} finally {
		closeIndexDb(db);
	}
}

if (isCli()) {
	console.log(JSON.stringify(buildIndex(), null, 2));
}
