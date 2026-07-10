// B"H
/**
 * @module SocialRagSearch
 * @description Searches vector shards, hydrates real comments, and returns both
 * post-level passages and a flat relevance-sorted comment result stream.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { resolveShard, rowsOf } = require('./shards.js');
const { sortHits } = require('./math.js');
const { embedQuery } = require('./llama.js');
const { joinComments } = require('./comments.js');
const { buildCommentHits } = require('./commentRelevance.js');
const { ragRoot } = require('./paths.js');
const { now, timed } = require('./timer.js');
const DIMS = 384;
function cleanRow(row) {
  const { vec, embedding, vector, text, sampleContent, previewEnglish, ...rest } = row || {};
  return { ...rest, previewEnglish, sampleContent, text, vectorDimensions: (vec || embedding || vector || []).length };
}
function exists(p) { try { return fs.existsSync(p); } catch { return false; } }
function sidecarFor($i, shard) {
  const base = shard.file.replace(/\.awtsdb$/, '');
  const root = ragRoot($i);
  const choices = [
    { meta: `${base}.meta.jsonl`, f32: `${base}.f32` },
    { meta: `${base}.fast-meta.jsonl`, f32: `${base}.fast-f32` },
    { meta: path.join(root, 'likkutei-v01-v39-fast-index/meta.jsonl'), f32: path.join(root, 'likkutei-v01-v39-fast-index/vectors.f32'), only: 'likkutei-v01-v39' }
  ];
  return choices.find(c => (!c.only || shard.id.includes(c.only) || shard.aliases?.includes('likkutei-sichos')) && exists(c.meta) && exists(c.f32)) || null;
}
function readSidecarRows(sidecar) {
  const matrix = fs.readFileSync(sidecar.f32);
  const lines = fs.readFileSync(sidecar.meta, 'utf8').split(/\n/).filter(Boolean);
  const rows = [];
  const max = Math.min(lines.length, Math.floor(matrix.length / (DIMS * 4)));
  for (let row = 0; row < max; row++) {
    const meta = JSON.parse(lines[row]);
    const vec = new Array(DIMS);
    const off = row * DIMS * 4;
    for (let i = 0; i < DIMS; i++) vec[i] = matrix.readFloatLE(off + i * 4);
    rows.push({ ...meta, vec });
  }
  return rows;
}
async function rowsForShard($i, shard) {
  const sidecar = sidecarFor($i, shard);
  if (sidecar) return { rows: readSidecarRows(sidecar), source: 'fast-f32-sidecar', sidecar: { meta: sidecar.meta, f32: sidecar.f32 } };
  const db = new AwtsmoosDB(shard.file, { debug: false, wal: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
  await db.open();
  try { return { rows: rowsOf(db.root[shard.listName]), source: 'awtsdb-list' }; }
  finally { await db.close?.(); }
}
async function ragSearch({ $i, lane, query, limit = 10, includeComments = true, maxCommentRows = 12, autoInstall = true }) {
  const timings = {};
  const totalStart = now();
  if (!query) throw Object.assign(new Error('Pass q or query.'), { code: 'MISSING_QUERY' });
  const shard = await timed('resolveShardMs', timings, () => resolveShard({ $i, lane }));
  if (!shard) throw Object.assign(new Error('No RAG shards available.'), { code: 'NO_RAG_SHARDS' });
  const emb = await timed('embeddingMs', timings, () => embedQuery({ $i, query, autoInstall }));
  const source = await timed('loadVectorsMs', timings, () => rowsForShard($i, shard));
  const hits = await timed('scoreVectorsMs', timings, async () => sortHits(source.rows, emb.vector, limit).map(hit => ({ ...hit, row: cleanRow(hit.row) })));
  const hydrated = includeComments ? await timed('hydrateCommentsMs', timings, () => joinComments({ $i, hits, maxRows: maxCommentRows })) : hits;
  const commentHits = includeComments ? await timed('rankCommentsMs', timings, async () => buildCommentHits(hydrated, query, Math.min(120, Math.max(limit * maxCommentRows, limit)))) : [];
  timings.totalMs = Number((now() - totalStart).toFixed(3));
  return { BH: 'B"H', query, shard, totalRows: source.rows.length, vectorSource: source.source, engine: 'llama-local-vector-rag', timings, embedder: emb.embedder, hits: hydrated, commentHits };
}
module.exports = { ragSearch, rowsForShard, sidecarFor };
