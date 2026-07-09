#!/usr/bin/env node
// B"H
/**
 * Search the real Meluket English AwtsmoosDB shard directly.
 *
 * No sidecar JSONL, no f32 shortcut: the query enters the first AwtsmoosDB
 * vessel, asks the DB vector system for nearest neighbors, and prints the full
 * stored text with all ordering metadata: series, post, verses, subsections,
 * row range, and exact comment IDs.
 */
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const SHARD = path.join(RAG, 'meluket-english-comments-rag.awtsdb');
const LIST = 'meluketEnglishCommentVectors';
const TOP_K = Number(process.env.TOP_K || 5);
const DEFAULT = ['worry and anxiety', 'fear of the future', 'sadness and worry', 'trust in G-d during trouble'];

function text(value = '') { return value == null ? '' : String(value); }
function vectorMeta(db) {
  const sys = db.root.__sys_vector__;
  if (!sys) return null;
  return sys[LIST] || sys[`root.${LIST}`] || sys.get?.(LIST) || sys.get?.(`root.${LIST}`) || null;
}
function renderHit(query, hit, rank) {
  const item = hit.item || {};
  const fields = [
    '==================================================', '',
    'QUERY', '', query, '',
    'RANK', '', String(rank), '',
    'SCORE', '', Number(hit.score).toFixed(6), '',
    'ID', '', text(item.id), '',
    'SERIES ID', '', text(item.seriesId), '',
    'POST ID', '', text(item.postId), '',
    'ALIAS ID', '', text(item.aliasId), '',
    'TITLE', '', text(item.title), '',
    'COMMENT PATH', '', text(item.commentPath), '',
    'VERSE START', '', text(item.verseStart), '',
    'VERSE END', '', text(item.verseEnd), '',
    'FIRST SUBSECTION', '', text(item.firstSubSection), '',
    'LAST SUBSECTION', '', text(item.lastSubSection), '',
    'ROW START', '', text(item.rowStart), '',
    'ROW END', '', text(item.rowEnd), '',
    'FIRST COMMENT ID', '', text(item.firstCommentId), '',
    'LAST COMMENT ID', '', text(item.lastCommentId), '',
    'COMMENT COUNT', '', text(item.commentCount), '',
    'COMMENT IDS', '', JSON.stringify(item.commentIds || []), '',
    'FULL COMMENT', '', text(item.text), '',
    '==================================================', ''
  ];
  return fields.join('\n');
}

async function main() {
  const queries = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT;
  const db = new AwtsmoosDB(SHARD, { debug: false, wal: false });
  await db.open();
  const list = db.root[LIST];
  const meta = vectorMeta(db);
  console.log(['B"H', 'MODE', 'real-awtsdb-vector-search', 'SHARD', SHARD, 'LIST', LIST, 'ROWS', String(list.length), 'VECTOR META', JSON.stringify(meta), 'RUNNER', JSON.stringify(runnerState({ modelRoot: RAG })), ''].join('\n'));
  for (const query of queries) {
    const embedded = await embedTextAuto(query, { modelRoot: RAG, noFallback: true, fresh: true });
    const hits = await db.vector.nearest(list, embedded.vector, TOP_K);
    hits.forEach((hit, index) => console.log(renderHit(query, hit, index + 1)));
  }
  await db.close?.();
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
