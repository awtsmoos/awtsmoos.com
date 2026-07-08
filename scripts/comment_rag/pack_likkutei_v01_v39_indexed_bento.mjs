#!/usr/bin/env node
/**
 * B"H
 *
 * In the chamber of the Awtsmoos, a slow scan once wandered through
 * every vessel one by one. Here the spark is gathered before the march:
 * the vector gate is opened first, then every record enters with its
 * embedding already bright, so HNSW can remember the roads between souls.
 *
 * This script never touches the production v01-v15 shard. It builds a
 * separate indexed bento shard for volumes 1-39, with old and new vectors
 * folded into one searchable AwtsmoosDB list.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const OLD = path.join(RAG, 'likkutei-v01-v15-llama-work/vectors.jsonl');
const NEW = path.join(RAG, 'likkutei-v16-v39-llama-work/vectors.jsonl');
const SHARD = path.join(RAG, 'likkutei-v01-v39-llama-rag.INDEXED-BENTO.awtsdb');
const SUMMARY = path.join(RAG, 'likkutei-v01-v39-llama-rag.INDEXED-BENTO.summary.json');
const LIST = 'llamaRecords';
const DIMENSIONS = 384;

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8')
    .split(/\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function normalizeRecord(raw) {
  const volume = Number(raw.volume);
  const vector = raw.vec || raw.embedding;
  return {
    ...raw,
    volume,
    vec: vector,
    realEmbedding: true,
    embeddingProvider: 'llama-embedding:bge-small-en-v1.5-q8_0',
    bentoSource: volume <= 15 ? 'v01-v15' : 'v16-v39'
  };
}

function validate(records, oldCount, newCount) {
  const ids = new Set();
  const bad = [];
  const duplicate = [];
  const volumes = new Set();
  for (const record of records) {
    volumes.add(Number(record.volume));
    if (!record.id || !record.text || !Array.isArray(record.vec) || record.vec.length !== DIMENSIONS) {
      bad.push(record.id || '(missing-id)');
    }
    if (ids.has(record.id)) duplicate.push(record.id);
    ids.add(record.id);
  }
  const expectedVolumes = Array.from({ length: 39 }, (_, index) => index + 1).join(',');
  const actualVolumes = Array.from(volumes).sort((a, b) => a - b).join(',');
  if (oldCount !== 1823 || newCount !== 11772) {
    throw new Error(`Unexpected source counts old=${oldCount} new=${newCount}`);
  }
  if (records.length !== 13595 || ids.size !== records.length || bad.length || duplicate.length) {
    throw new Error(JSON.stringify({ total: records.length, unique: ids.size, bad: bad.slice(0, 5), duplicate: duplicate.slice(0, 5) }));
  }
  if (actualVolumes !== expectedVolumes) {
    throw new Error(`Unexpected volume coverage ${actualVolumes}`);
  }
  return { uniqueIds: ids.size, volumes: Array.from(volumes).sort((a, b) => a - b) };
}

async function removeShard() {
  for (const suffix of ['', '.wal', '.lock']) {
    const file = SHARD + suffix;
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  }
}

async function main() {
  const oldRecords = readJsonl(OLD).map(normalizeRecord);
  const newRecords = readJsonl(NEW).map(normalizeRecord);
  const records = [...oldRecords, ...newRecords];
  const valid = validate(records, oldRecords.length, newRecords.length);

  await removeShard();
  const db = new AwtsmoosDB(SHARD, { debug: false });
  await db.open();
  await db.createList(db.root, LIST);
  await db.vector.enable(db.root[LIST], { dimensions: DIMENSIONS, metric: 'cosine' });

  let written = 0;
  for (const record of records) {
    await db.root[LIST].push(record);
    written += 1;
    if (written % 500 === 0) console.log(`indexed ${written}/${records.length}`);
  }

  await db.waitForIdle();
  const meta = db.root.__sys_vector__?.get?.('root.llamaRecords') || null;
  await db.close?.();

  const stat = fs.statSync(SHARD);
  const summary = {
    BH: 'B"H',
    shard: SHARD,
    listName: LIST,
    summary: SUMMARY,
    records: records.length,
    oldRecords: oldRecords.length,
    newRecords: newRecords.length,
    uniqueIds: valid.uniqueIds,
    dimensions: DIMENSIONS,
    volumes: { first: valid.volumes[0], last: valid.volumes.at(-1), count: valid.volumes.length },
    vectorEnabled: Boolean(meta),
    vectorMeta: meta,
    bytes: stat.size,
    finished: new Date().toISOString()
  };
  fs.writeFileSync(SUMMARY, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
