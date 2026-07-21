#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file assemble_sichos_kodesh_pack_summary.mjs
 * @description
 * Twelve sealed testimonies become one durable receipt before Awtsmoos.com
 * receives the complete Sichos Kodesh revelation.
 */

import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_ROOT = process.env.SICHOS_KODESH_OUTPUT_ROOT
	|| '/Users/awtsmoos/Documents/Awtsmoos/docs/torah/sichos-kodesh-ai/embedding-output';
const JOB_ROOT = path.join(OUTPUT_ROOT, 'sichos-kodesh-english-comments-embedding-job');
const TOTAL_RECORDS = 68490;
const PART_COUNT = 12;
const parts = [];
for (let part = 1; part <= PART_COUNT; part += 1) {
	const file = path.join(JOB_ROOT, `pack-part-${part}-summary.json`);
	parts.push(JSON.parse(fs.readFileSync(file, 'utf8')));
}
const records = parts.reduce((sum, part) => sum + Number(part.records || 0), 0);
if (records !== TOTAL_RECORDS) throw new Error(`expected ${TOTAL_RECORDS}, got ${records}`);
fs.writeFileSync(
	path.join(JOB_ROOT, 'pack-awtsdb-summary.json'),
	`${JSON.stringify({ BH: 'B"H', records, parts }, null, 2)}\n`
);
console.log(JSON.stringify({ BH: 'B"H', records, parts: parts.length }, null, 2));
