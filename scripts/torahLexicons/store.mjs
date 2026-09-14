//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module ShardedLexiconStore
 * @description
 * One short-lived worker copies one native source letter-range into a compact
 * serving shard. Every lexical entry becomes one exact-length schema-coded
 * binary value while sparse browse anchors retain their bounded navigation role.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';
import { anchorValue, shouldAnchor } from './anchors.mjs';
import { createStreamingEntryMap } from './streaming-entry-map.mjs';

const require = createRequire(import.meta.url);
const {
	entryKey,
	prefixBounds,
	shardToken
} = require('../../geelooy/api/social/helper/search/lexicon/keySpace.js');
const { encodeLexiconRecord } = require(
	'../../geelooy/api/social/helper/search/lexicon/binary/recordWriter.js'
);

const READ_OPTIONS = Object.freeze({ readOnly: true, maxCachedPages: 8 });
const WRITE_OPTIONS = Object.freeze({
	compression: true,
	reuseFreedSpace: 'verified',
	maxCachedPages: 16,
	dirtyPageFlushThreshold: 8
});

/** Converts one hexadecimal first-codepoint token into its lexical range prefix. */
function tokenLetter(token) {
	const codePoint = Number.parseInt(String(token), 16);
	if (!Number.isFinite(codePoint)) throw new Error(`invalid_lexicon_token:${token}`);
	return String.fromCodePoint(codePoint);
}

/** Resolves one lazy source value without retaining storage proxies. */
function resolveValue(value) {
	return value && typeof value.__resolve__ === 'function'
		? value.__resolve__()
		: value;
}

/** Removes a prior candidate shard and its write-ahead journal before rebuild. */
async function prepareShard(file) {
	await fs.mkdir(path.dirname(file), { recursive: true });
	await fs.rm(file, { force: true });
	await fs.rm(`${file}.wal`, { force: true });
}

/** Persists one compact lexical row and one sparse browse anchor. */
function writeEntry(entryMap, anchorMap, entry, count) {
	const key = entryKey(entry.normalized, count);
	entryMap.append(key, encodeLexiconRecord(entry));
	if (shouldAnchor(count)) anchorMap.append(key, anchorValue(entry, key));
}

/** Builds one serving shard from exactly one bounded native source range. */
export async function buildShard({ sourceDatabase, file, token, expected }) {
	await prepareShard(file);
	const source = new AwtsmoosDB(sourceDatabase, READ_OPTIONS);
	const target = new AwtsmoosDB(file, WRITE_OPTIONS);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	try {
		await source.open();
		await target.open();
		if (!source.root.entries) throw new Error(`source_entries_missing:${token}`);
		const entryMap = createStreamingEntryMap(target, 'entries');
		const anchorMap = createStreamingEntryMap(target, 'anchors');
		const bounds = prefixBounds(tokenLetter(token));
		for await (const row of source.range(source.root.entries, bounds[0], bounds[1])) {
			const entry = resolveValue(row?.value);
			if (!entry || shardToken(entry.normalized) !== token) continue;
			writeEntry(entryMap, anchorMap, entry, count);
			count += 1;
			if (count % 32 === 0) {
				peakRss = Math.max(peakRss, process.memoryUsage().rss);
			}
		}
		let publishedCount = 0;
		target.batch(() => {
			publishedCount = entryMap.publish();
			anchorMap.publish();
		});
		if (publishedCount !== count) throw new Error(`shard_publish_count_mismatch:${token}`);
		if (count !== Number(expected)) {
			throw new Error(`shard_count_mismatch:${token}:${count}:${expected}`);
		}
		await target.waitForIdle();
		if (!target.verify().ok) throw new Error(`shard_verify_failed:${token}`);
	} finally {
		await target.close();
		await source.close();
	}
	await verifyReadOnly(file, token);
	return { count, peakRss: Math.max(peakRss, process.memoryUsage().rss) };
}

/** Reopens the finished shard read-only and verifies both serving maps. */
async function verifyReadOnly(file, token) {
	const database = new AwtsmoosDB(file, READ_OPTIONS);
	try {
		await database.open();
		if (!database.root.entries || !database.root.anchors || !database.verify().ok) {
			throw new Error(`shard_readonly_verify_failed:${token}`);
		}
	} finally {
		await database.close();
	}
}
