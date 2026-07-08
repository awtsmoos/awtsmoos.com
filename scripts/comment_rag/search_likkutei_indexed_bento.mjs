#!/usr/bin/env node
/**
 * B"H
 *
 * The Awtsmoos whispers the query into a llama-born vector, and the indexed
 * bento shard answers through the graph instead of dragging every heavy record
 * through a full database scan. The old crawl becomes a road; the road becomes
 * a breath; the breath returns with sources from v01-v39 together.
 */
import path from 'path';
import { createRequire } from 'module';
import { performance } from 'perf_hooks';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const SHARD = path.join(RAG, 'likkutei-v01-v39-llama-rag.INDEXED-BENTO.awtsdb');
const QUERIES = process.argv.slice(2).length ? process.argv.slice(2) : [
  'Mashiach and redemption of the Jewish people',
  'teshuvah repentance changes the person and removes decree',
  'charity giving repeatedly even one hundred times',
  'the soul and body belong to Hashem not to a person'
];

function compact(item, score) {
  return {
    score: Number(score?.toFixed ? score.toFixed(6) : score),
    volume: item.volume,
    sourceBand: Number(item.volume) <= 15 ? 'v01-v15' : 'v16-v39',
    id: item.id,
    verses: [item.verseStart, item.verseEnd],
    sample: String(item.text || item.sampleContent || '').replace(/\s+/g, ' ').slice(0, 240)
  };
}

async function searchOne(db, query) {
  const start = performance.now();
  const embedded = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
  const afterEmbed = performance.now();
  const results = await db.vector.nearest(db.root.llamaRecords, embedded.vector, 8);
  const afterSearch = performance.now();
  return {
    query,
    provider: embedded.provider,
    timingMs: {
      embed: Math.round(afterEmbed - start),
      search: Math.round(afterSearch - afterEmbed),
      total: Math.round(afterSearch - start)
    },
    counts: {
      top8FromV01V15: results.filter(row => Number(row.item.volume) <= 15).length,
      top8FromV16V39: results.filter(row => Number(row.item.volume) >= 16).length
    },
    results: results.map(row => compact(row.item, row.score))
  };
}

async function main() {
  const db = new AwtsmoosDB(SHARD, { debug: false });
  await db.open();
  const searches = [];
  for (const query of QUERIES) searches.push(await searchOne(db, query));
  await db.close?.();
  console.log(JSON.stringify({
    BH: 'B"H',
    shard: SHARD,
    runner: runnerState({ modelRoot: RAG }),
    searchedAt: new Date().toISOString(),
    searches
  }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
