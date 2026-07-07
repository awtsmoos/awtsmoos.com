// B"H
/**
 * @file pack_likkutei_llama_vectors.mjs
 * @chapter The Search Vessel With A Name That Does Not Collide
 * @description Packs finished llama vectors into a separate AwtsmoosDB shard.
 * The list name is `llamaRecords`, not `chunks`, because persisted vector
 * metadata under `chunks` can collide with revived function fallback access.
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
const vectors = process.env.LLAMA_VECTORS_JSONL || path.join(work, 'vectors.jsonl');
const shard = process.env.LLAMA_RAG_SHARD || path.join(rag, 'likkutei-v01-v15-llama-rag.awtsdb');
const summary = process.env.LLAMA_PACK_SUMMARY || path.join(work, 'pack-summary.json');
const listName = 'llamaRecords';
function readJsonl(file) { return fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).map(line => JSON.parse(line)); }
function verify(records) {
  const volumes = new Set(records.map(r => Number(r.volume)));
  const bad = records.filter(r => !r.id || !r.text || !Array.isArray(r.embedding) || r.embedding.length !== 384 || r.volume < 1 || r.volume > 15);
  if (records.length !== 1823 || bad.length || [...volumes].sort((a, b) => a - b).join(',') !== '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15') throw new Error(`B"H verification failed records=${records.length} bad=${bad.length}`);
}
function asDbRecord(r) { return { ...r, vec: r.embedding, embeddingProvider: r.embeddingProvider || 'llama-embedding:bge-small-en-v1.5-q8_0', realEmbedding: true, packedAt: new Date().toISOString() }; }
async function freshDb() { const db = new AwtsmoosDB(shard, { debug: false }); await db.open(); return db; }
async function pack(records) {
  for (const ext of ['', '.wal']) if (fs.existsSync(shard + ext)) fs.rmSync(shard + ext, { force: true });
  const db = await freshDb();
  await db.createList(db.root, listName);
  await db.vector.enable(db.root[listName], { dimensions: 384, metric: 'cosine' });
  for (const record of records) await db.root[listName].push(asDbRecord(record));
  await db.waitForIdle(); await db.close?.();
}
async function sample() {
  const db = await freshDb();
  const q = await embedTextAuto('Torah mitzvos teshuvah redemption', { modelRoot: rag, noFallback: true, fresh: true });
  const nearest = await db.vector.nearest(db.root[listName], q.vector, 5);
  await db.close?.();
  return nearest.map(x => ({ score: x.score, id: x.item.id, volume: x.item.volume, verses: [x.item.verseStart, x.item.verseEnd], sample: String(x.item.text || '').slice(0, 140) }));
}
async function main() {
  const records = readJsonl(vectors); verify(records); await pack(records);
  const samples = await sample();
  const out = { BH: 'B"H', shard, listName, vectors, records: records.length, dimensions: 384, volumes: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], runner: runnerState({ modelRoot: rag }), samples, finished: new Date().toISOString() };
  fs.writeFileSync(summary, JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
