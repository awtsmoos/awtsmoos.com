//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ShardedLexiconStore
 * @description
 * The Awtsmoos lets one worker hold one first-letter vessel, never the full dictionary sea;
 * Awtsmoos.com scans one source line at a time, writes one small AwtsmoosDB shard, verifies, closes, and frees memory.
 */

import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline';
import { createRequire } from 'node:module';
import AwtsmoosDB from '../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js';

const require = createRequire(import.meta.url);
const { entryKey, shardToken } = require('../../geelooy/api/social/helper/search/lexicon/keySpace.js');
const WRITE_OPTIONS = Object.freeze({
	compression: true,
	reuseFreedSpace: 'verified',
	maxCachedPages: 16,
	dirtyPageFlushThreshold: 8
});

export async function buildShard({ input, file, token, expected }) {
	await fsp.mkdir(path.dirname(file), { recursive: true });
	await fsp.rm(file, { force: true });
	await fsp.rm(`${file}.wal`, { force: true });
	const database = new AwtsmoosDB(file, WRITE_OPTIONS);
	let count = 0;
	let peakRss = process.memoryUsage().rss;
	try {
		await database.open();
		database.root.entries = new database.Map();
		const lines = readline.createInterface({ input: fs.createReadStream(input, 'utf8'), crlfDelay: Infinity });
		for await (const line of lines) {
			if (!line.trim()) continue;
			const entry = JSON.parse(line);
			if (shardToken(entry.normalized) !== token) continue;
			await database.root.entries.set(entryKey(entry.normalized, count), entry);
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

async function verifyReadOnly(file, token) {
	const database = new AwtsmoosDB(file, { readOnly: true, maxCachedPages: 8 });
	try {
		await database.open();
		if (!database.root.entries || !database.verify().ok) throw new Error(`shard_readonly_verify_failed:${token}`);
	} finally {
		await database.close();
	}
}
