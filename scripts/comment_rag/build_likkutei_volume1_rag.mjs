// B"H
/**
 * Volume 1 Likkutei Sichos comment RAG builder.
 * Reads legacy .awtsmoosJSON comments, groups a few verses per chunk, embeds
 * with the local GGUF BGE model, and writes only a separate vector shard.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { embedTextAuto, runnerState } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const SERIES = 'likkuteiSichosVolume1';
const ALIAS = 'likkutei_translation_en';
const BASE = path.join(ROOT, 'social/heichelos/ikar/comments/atSeries', SERIES, 'atPost');
const RAG = path.join(ROOT, 'ai/comment-rag');
const SHARD = process.env.LIKKUTEI_V1_RAG_SHARD || path.join(RAG, 'likkutei-volume1-rag.awtsdb');
const VERSES_PER_CHUNK = Number(process.env.VERSES_PER_CHUNK || 3);
const EMBED_CONCURRENCY = Number(process.env.EMBED_CONCURRENCY || 8);
const skipped = [];

function files() {
  return fs.readdirSync(BASE).sort().map(post => ({ post, file: path.join(BASE, post, `${ALIAS}.awtsmoosJSON`) })).filter(x => fs.existsSync(x.file));
}
function safeLegacy(file) {
  try { return legacy.deserializeBinary(fs.readFileSync(file)); }
  catch (e) { skipped.push({ file, reason: String(e.message || e) }); return null; }
}
function readPost(entry) {
  const obj = safeLegacy(entry.file);
  if (!obj || typeof obj !== 'object') { skipped.push({ file: entry.file, reason: 'empty_or_non_object' }); return []; }
  return Object.keys(obj).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b)).map(section => ({
    post: entry.post, section: Number(section), comments: Array.isArray(obj[section]) ? obj[section] : []
  })).filter(x => x.comments.length);
}
function textOf(comments) {
  return comments.map(c => `[${c.verseSection}:${c.subSection ?? c.dayuh?.subSection ?? ''}] ${c.sourceHebrew || c.dayuh?.sourceHebrew || ''}\nEN: ${c.content || ''}`).join('\n');
}
function chunksForPost(postSections) {
  const chunks = [];
  for (let i = 0; i < postSections.length; i += VERSES_PER_CHUNK) {
    const group = postSections.slice(i, i + VERSES_PER_CHUNK);
    const comments = group.flatMap(x => x.comments);
    const first = group[0], last = group[group.length - 1];
    chunks.push({
      id: `${SERIES}:${first.post}:v${first.section}-v${last.section}`,
      source: 'likkutei_sichos', seriesId: SERIES, postId: first.post,
      aliasId: ALIAS, verseStart: first.section, verseEnd: last.section,
      commentCount: comments.length, text: textOf(comments), sampleContent: comments[0]?.content || '',
      firstCommentId: comments[0]?.id || '', lastCommentId: comments.at(-1)?.id || ''
    });
  }
  return chunks;
}
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); }
  }));
  return out;
}
async function embedChunk(chunk, i) {
  const embedded = await embedTextAuto(chunk.text, { modelRoot: RAG });
  if ((i + 1) % 25 === 0) console.error(`B"H embedded ${i + 1}`);
  return { ...chunk, vec: embedded.vector, embeddingProvider: embedded.provider, realEmbedding: embedded.realEmbedding };
}
async function writeShard(records) {
  fs.mkdirSync(path.dirname(SHARD), { recursive: true });
  for (const ext of ['', '.wal']) if (fs.existsSync(SHARD + ext)) fs.rmSync(SHARD + ext, { force: true });
  const db = new AwtsmoosDB(SHARD, { debug: false });
  await db.open(); await db.createList(db.root, 'chunks');
  await db.vector.enable(db.root.chunks, { dimensions: 384, metric: 'cosine' });
  for (const record of records) await db.root.chunks.push(record);
  await db.waitForIdle();
  return db;
}
async function query(db, text, k = 8) {
  const q = await embedTextAuto(text, { modelRoot: RAG });
  return (await db.vector.nearest(db.root.chunks, q.vector, k)).map(r => ({ score: r.score, id: r.item.id, postId: r.item.postId, verses: [r.item.verseStart, r.item.verseEnd], comments: r.item.commentCount, sample: r.item.sampleContent.slice(0,140) }));
}
async function main() {
  const allFiles = files();
  const sections = allFiles.flatMap(readPost);
  const byPost = new Map();
  for (const s of sections) (byPost.get(s.post) || byPost.set(s.post, []).get(s.post)).push(s);
  const chunks = [...byPost.values()].flatMap(chunksForPost);
  console.error(`B"H files=${allFiles.length} sections=${sections.length} chunks=${chunks.length} skipped=${skipped.length}`);
  const records = await mapLimit(chunks, EMBED_CONCURRENCY, embedChunk);
  const db = await writeShard(records);
  const searches = {
    mitzvos: await query(db, 'Torah and mitzvos are eternal for every Jew'),
    teshuvah: await query(db, 'repentance return to Hashem with joy'),
    matanah: await query(db, 'giving an item on condition to return it')
  };
  await db.close();
  console.log(JSON.stringify({ BH: 'B"H', shard: SHARD, files: allFiles.length, sections: sections.length, chunks: records.length, skipped, model: runnerState({ modelRoot: RAG }), searches }, null, 2));
}
main().catch(e => { console.error(e.stack || e); process.exit(1); });
