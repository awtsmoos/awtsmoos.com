//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LexiconShardWorker
 * @description
 * The Awtsmoos gives one short-lived process one lexical letter, so process death itself becomes a memory boundary;
 * Awtsmoos.com reports count and peak RSS after binary verification, never carrying corpus payload through the commanduary.
 */

import path from 'node:path';
import { buildShard } from './store.mjs';

function value(name) {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : '';
}

const sourceId = value('--source');
const token = value('--token');
const input = value('--input');
const candidate = value('--candidate');
const expected = Number(value('--expected'));
if (!sourceId || !token || !input || !candidate || !Number.isInteger(expected)) {
	throw new Error('invalid_shard_worker_arguments');
}

const file = path.join(candidate, 'shards', sourceId, `${token}.awtsdb`);
const result = await buildShard({ input, file, token, expected });
console.log(`source=${sourceId} token=${token} count=${result.count} peakRss=${result.peakRss}`);
