//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module LexiconShardWorker
 * @description
 * One short-lived worker copies one first-letter range from a completed native
 * source database into one verified serving shard. The worker receives only
 * paths, counts, and identifiers, never serialized corpus payloads.
 */

import path from 'node:path';
import { buildShard } from './store.mjs';

/** Reads one scalar command argument without introducing an options framework. */
function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

const sourceId = value('--source');
const token = value('--token');
const sourceDatabase = value('--database');
const candidate = value('--candidate');
const expected = Number(value('--expected'));

if (!sourceId || !token || !sourceDatabase || !candidate || !Number.isInteger(expected)) {
	throw new Error('invalid_shard_worker_arguments');
}

const file = path.join(candidate, 'shards', sourceId, `${token}.awtsdb`);
const result = await buildShard({
	sourceDatabase,
	file,
	token,
	expected
});

console.log(
	`source=${sourceId} token=${token} count=${result.count} peakRss=${result.peakRss}`
);
