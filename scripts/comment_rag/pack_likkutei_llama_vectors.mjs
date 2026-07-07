// B"H
/**
 * @file pack_likkutei_llama_vectors.mjs
 * @chapter The List Vessel That Cannot Lie
 * @description Packs completed llama vectors into a real AwtsmoosDB list. The
 * VectorManager nearest() scans this DB list if no HNSW graph exists, so search
 * is real AwtsmoosDB-backed and cannot depend on external JSONL.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');
const root = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const rag = path.join(root, 'ai/comment-rag');
const work = path.join(rag, 'likkutei-v01-v15-llama-work');
const vectors = path.join(work, 'vectors.jsonl');
const shard = path.join(rag, 'likkutei-v01-v15-llama-rag.awtsdb');
const summary = path.join(work, 'pack-summary.json');
const listName = 'llamaRecords';
const records = fs.readFileSync(vectors, 'utf8').trim().split(/\n/).map(JSON.parse);
const vols = [...new Set(records.map(r => Number(r.volume)))].sort((a, b) => a - b);
const bad = records.filter(r => !r.id || !r.text || !Array.isArray(r.embedding) || r.embedding.length !== 384 || r.volume < 1 || r.volume > 15);
if (records.length !== 1823 || bad.length || vols.join(',') !== '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15') throw new Error(`B"H vector verification failed records=${records.length} bad=${bad.length} vols=${vols}`);
for (const ext of ['', '.wal', '.lock']) if (fs.existsSync(shard + ext)) fs.rmSync(shard + ext, { force: true });
const db = new AwtsmoosDB(shard, { debug: false });
await db.open(); await db.createList(db.root, listName);
for (const r of records) await db.root[listName].push({ ...r, vec: r.embedding, realEmbedding: true, embeddingProvider: 'llama-embedding:bge-small-en-v1.5-q8_0' });
await db.waitForIdle(); await db.close?.();
const testDb = new AwtsmoosDB(shard, { debug: false }); await testDb.open();
const t0 = performance.now(); const q = await embedTextAuto('Mashiach and redemption', { modelRoot: rag, noFallback: true, fresh: true }); const t1 = performance.now();
const samples = testDb.vector.nearest(testDb.root[listName], q.vector, 5); const t2 = performance.now();
await testDb.close?.();
const out = { BH: 'B"H', shard, listName, vectors, records: records.length, dimensions: 384, volumes: vols, runner: runnerState({ modelRoot: rag }), timingMs: { embedding: Math.round(t1 - t0), search: Math.round(t2 - t1), total: Math.round(t2 - t0) }, samples: samples.map(x => ({ score: x.score, id: x.item.id, volume: x.item.volume, verses: [x.item.verseStart, x.item.verseEnd], sample: String(x.item.text || '').slice(0, 160) })), finished: new Date().toISOString() };
fs.writeFileSync(summary, JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 2));
