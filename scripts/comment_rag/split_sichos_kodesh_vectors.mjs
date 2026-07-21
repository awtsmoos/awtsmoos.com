#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file split_sichos_kodesh_vectors.mjs
 * @description
 * The Awtsmoos divides one verified river of vectors into twelve immutable
 * tributaries, each small enough to become a healthy Awtsmoos.com search vessel.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

const OUTPUT_ROOT = process.env.SICHOS_KODESH_OUTPUT_ROOT
	|| '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output';
const JOB_ROOT = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-embedding-job');
const SOURCE = path.join(JOB_ROOT, 'vectors.jsonl');
const PART_ROOT = path.join(JOB_ROOT, 'vector-parts');
const TOTAL_RECORDS = 68490;
const PART_SIZE = 6000;
const PART_COUNT = Math.ceil(TOTAL_RECORDS / PART_SIZE);

fs.rmSync(PART_ROOT, { recursive: true, force: true });
fs.mkdirSync(PART_ROOT, { recursive: true });

const streams = Array.from({ length: PART_COUNT }, (_value, index) => {
	const file = path.join(PART_ROOT, `part-${index + 1}.jsonl`);
	return fs.createWriteStream(file, { flags: 'wx' });
});
const counts = Array.from({ length: PART_COUNT }, () => 0);
const input = readline.createInterface({
	input: fs.createReadStream(SOURCE),
	crlfDelay: Infinity
});
let total = 0;
for await (const line of input) {
	if (!line.trim()) continue;
	const partIndex = Math.floor(total / PART_SIZE);
	if (partIndex >= streams.length) throw new Error(`too many vectors at ${total + 1}`);
	streams[partIndex].write(`${line}\n`);
	counts[partIndex] += 1;
	total += 1;
}
await Promise.all(streams.map(stream => new Promise((resolve, reject) => {
	stream.on('error', reject);
	stream.end(resolve);
})));
if (total !== TOTAL_RECORDS) throw new Error(`expected ${TOTAL_RECORDS}, got ${total}`);
const expected = counts.map((count, index) => Math.min(PART_SIZE, TOTAL_RECORDS - (index * PART_SIZE)));
if (JSON.stringify(counts) !== JSON.stringify(expected)) {
	throw new Error(`part counts mismatch ${JSON.stringify(counts)}`);
}
fs.writeFileSync(
	path.join(PART_ROOT, 'summary.json'),
	`${JSON.stringify({ BH: 'B"H', total, counts }, null, 2)}\n`
);
console.log(JSON.stringify({ BH: 'B"H', total, counts }, null, 2));
