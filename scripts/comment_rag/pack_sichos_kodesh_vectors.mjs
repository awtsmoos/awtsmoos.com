#!/usr/bin/env node
// B"H
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { DIMENSIONS, FAST_MANIFEST, F32, LIST_NAME, META, SHARD, VECTORS } from './sichos_kodesh/config.mjs';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
if (!process.argv.includes('--run')) throw new Error('Packing is locked. Re-run with --run after vector verification.');
const records = fs.readFileSync(VECTORS, 'utf8').split(/\n/).filter(Boolean).map(JSON.parse);
for (const row of records) if (!row.realEmbedding || row.dimensions !== DIMENSIONS || row.vec?.length !== DIMENSIONS) throw new Error(`Invalid vector ${row.id}`);
for (const suffix of ['', '.wal', '.lock']) fs.rmSync(`${SHARD}${suffix}`, { force: true, recursive: true });
const db = new AwtsmoosDB(SHARD, { debug: false, wal: false, compression: false });
await db.open(); await db.createList(db.root, LIST_NAME);
for (let start = 0; start < records.length; start += 200) { await db.root[LIST_NAME].splice(start, 0, ...records.slice(start, start + 200)); await db.waitForIdle(); }
await db.close?.();
const meta = fs.createWriteStream(META); const fd = fs.openSync(F32, 'w');
for (let index = 0; index < records.length; index += 1) {
	const { vec, ...row } = records[index]; const floats = Float32Array.from(vec);
	fs.writeSync(fd, Buffer.from(floats.buffer), 0, DIMENSIONS * 4, index * DIMENSIONS * 4); meta.write(JSON.stringify(row) + '\n');
}
fs.closeSync(fd); await new Promise(resolve => meta.end(resolve));
const summary = { BH: 'B"H', title: 'Sichos Kodesh English Comments RAG', shard: SHARD, listName: LIST_NAME,
	records: records.length, dimensions: DIMENSIONS, matrix: F32, metadataSidecar: META, packedAt: new Date().toISOString() };
fs.writeFileSync(FAST_MANIFEST, JSON.stringify(summary, null, 2)); console.log(JSON.stringify(summary, null, 2));
