// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ShardedLexiconStore
 * @description
 * The Awtsmoos lets one short-lived worker carry one first-letter vessel, writing entries and sparse anchors into one AwtsmoosDB;
 * Awtsmoos.com streams legacy migration input line by line, verifies native truth, closes the shard, and never gathers the dictionary sea.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';
import { anchorValue, shouldAnchor } from './anchors.mjs';

const require = createRequire(import.meta.url);
const { entryKey, shardToken } = require('../../geelooy/api/social/helper/search/lexicon/keySpace.js');
const WRITE_OPTIONS = Object.freeze({
	compression: true,
	reuseFreedSpace: 'verified',
	maxCachedPages: 16,
	dirtyPageFlushThreshold: 8
});

/** Removes a prior candidate shard and its journal before one deterministic rebuild. */
async function prepareShard(file) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	await fsp.rm(file, { force: true });
	await fsp.rm(`${file}.wal`, { force: true });
}

/** Persists one matching entry and, at the shared stride, one sparse lexical anchor. */
async function writeEntry(database, entry, count) {
	const key = entryKey(entry.normalized, count);
	await database.root.entries.set(key, entry);
	if (shouldAnchor(count)) await database.root.anchors.set(key, anchorValue(entry, key));
}

/** Builds one first-letter native shard from bounded migration input and returns worker memory evidence. */
export async function buildShard({ input, file, token, expected }) {
	await prepareShard(file);
	const database = new AwtsmoosDB(file, WRITE_OPTIONS);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	try {
		await database.open();
		database.root.entries = new database.Map();
		database.root.anchors = new database.Map();
		const lines = readline.createInterface({ input: fs.createReadStream(input, 'utf8'), crlfDelay: Infinity });
		for await (const line of lines) {
			if (!line.trim()) continue;
			const entry = JSON.parse(line);
			if (shardToken(entry.normalized) !== token) continue;
			await writeEntry(database, entry, count);
			count += 1;
			if (count % 32 === 0) {
				await database.waitForIdle();
				peakRss = Math.max(peakRss, process.memoryUsage().rss);
			}
		}
		if (count !== Number(expected)) throw new Error(`shard_count_mismatch:${token}:${count}:${expected}`);
		await database.waitForIdle();
		if (!database.verify().ok) throw new Error(`shard_verify_failed:${token}`);
	} finally {
		await database.close();
	}
	await verifyReadOnly(file, token);
	return { count, peakRss: Math.max(peakRss, process.memoryUsage().rss) };
}

/** Reopens the finished shard read-only and requires both lexical and sparse-anchor maps to verify. */
async function verifyReadOnly(file, token) {
	const database = new AwtsmoosDB(file, { readOnly: true, maxCachedPages: 8 });
	try {
		await database.open();
		if (!database.root.entries || !database.root.anchors || !database.verify().ok) {
			throw new Error(`shard_readonly_verify_failed:${token}`);
		}
	} finally {
		await database.close();
	}
}
