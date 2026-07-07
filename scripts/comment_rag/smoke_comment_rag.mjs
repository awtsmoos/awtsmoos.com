// B"H
/**
 * A small RAG lantern for the comments tree.
 * It leaves the living comments untouched and writes only a separate vector shard.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const API = process.env.SOCIAL_API_BASE || 'http://127.0.0.1:8080/api/social';
const DB_ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const MODEL_ROOT = process.env.AWTSMOOS_EMBED_MODEL_ROOT || path.join(DB_ROOT, 'ai/comment-rag');
const SHARD = process.env.COMMENT_RAG_SHARD || path.join(DB_ROOT, 'ai/comment-rag/comment-rag-smoke.awtsdb');
const SHS_WORK = process.env.SHS_WORK || '/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work';

async function api(route) {
  const res = await fetch(API + route);
  const text = await res.text();
  let body; try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}
function shsRows() {
  const file = path.join(SHS_WORK, 'translations_5751_content_only.jsonl');
  return fs.readFileSync(file, 'utf8').trim().split(/\n/).filter(Boolean).map(JSON.parse);
}
function commentText(item) {
  return [item.sourceHebrew, item.content].filter(Boolean).join('\nEnglish: ');
}
async function getLikkuteiKnown() {
  const known = [
    ['likkuteiSichosVolume1', 'BH_POST_1763106571540_theRebbe_66'],
    ['likkuteiSichosVolume6', 'BH_POST_1763106575106_theRebbe_141']
  ];
  const out = [];
  for (const [seriesId, postId] of known) {
    const route = `/heichelos/ikar/series/${seriesId}/post/${postId}/comments/aliases/likkutei_translation_en/sections`;
    const sections = await api(route);
    const first = sections.body?.success?.[0];
    if (sections.status !== 200 || first == null) continue;
    const sample = await api(`/heichelos/ikar/series/${seriesId}/post/${postId}/comments/aliases/likkutei_translation_en?verseSection=${first}`);
    const comment = sample.body?.success?.[0];
    if (sample.status === 200 && comment) out.push(comment);
  }
  return out;
}
function asRecord(source, comment) {
  return {
    id: `${source}:${comment.id}`,
    source,
    seriesId: comment.seriesId,
    postId: comment.parentId || comment.postId,
    verseSection: String(comment.verseSection || comment.dayuh?.verseSection || ''),
    subSection: comment.dayuh?.subSection || comment.subSection || null,
    text: commentText(comment),
    content: comment.content,
    sourceHebrew: comment.sourceHebrew || comment.dayuh?.sourceHebrew || ''
  };
}
async function embedRecord(record) {
  const embedded = await embedTextAuto(record.text, { modelRoot: MODEL_ROOT });
  return { ...record, vec: embedded.vector, embeddingProvider: embedded.provider, realEmbedding: embedded.realEmbedding };
}
async function buildRecords() {
  const shs = shsRows();
  const picks = [shs[1000], shs[Math.floor(shs.length / 2)], shs[shs.length - 1000]].map(x => ({...x, parentId: x.postId}));
  const likkutei = await getLikkuteiKnown();
  return [...picks.map(x => asRecord('sefer_hasichos', x)), ...likkutei.map(x => asRecord('likkutei_sichos', x))];
}
async function main() {
  fs.mkdirSync(path.dirname(SHARD), { recursive: true });
  for (const extra of ['', '.wal']) if (fs.existsSync(SHARD + extra)) fs.rmSync(SHARD + extra, { force: true });
  const db = new AwtsmoosDB(SHARD, { debug: false });
  await db.open();
  await db.createList(db.root, 'comments');
  await db.vector.enable(db.root.comments, { dimensions: 384, metric: 'cosine' });
  const records = [];
  for (const record of await buildRecords()) {
    const ready = await embedRecord(record);
    await db.root.comments.push(ready);
    records.push(ready);
  }
  await db.waitForIdle();
  const q = await embedTextAuto('redemption and influencing others', { modelRoot: MODEL_ROOT });
  const nearest = await db.vector.nearest(db.root.comments, q.vector, 5);
  await db.close();
  console.log(JSON.stringify({BH:'B"H', shard:SHARD, model:runnerState({modelRoot:MODEL_ROOT}), indexed:records.length, queryProvider:q.provider, results:nearest.map(x=>({score:x.score, source:x.item.source, id:x.item.id, verseSection:x.item.verseSection, content:x.item.content?.slice(0,120)}))}, null, 2));
}
main().catch(err => { console.error(err.stack || err); process.exit(1); });
