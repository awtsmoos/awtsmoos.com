#!/usr/bin/env node
// B"H
/**
 * Prepare Sefer HaSichos English-comment embedding job.
 * Default mode DOES NOT call the embedding model. It only builds a manifest.
 * To actually embed later, run with --run-embeddings after alignment is clean.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const { embedTextAuto } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const OUT_DIR = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const SERIES_ROOT = path.join(DB_ROOT, 'social/heichelos/ikar/series');
const ALIAS = 'sefer_hasichos_translation_en';
const RUN_EMBEDDINGS = process.argv.includes('--run-embeddings');
const REQUIRE_CLEAN = !process.argv.includes('--allow-dirty');
const CHUNK_SIZE = Number(process.env.SHICHOSE_CHUNK_SIZE || 18);
const OVERLAP = Number(process.env.SHICHOSE_CHUNK_OVERLAP || 3);

function openCommentsDb() { const db = new AwtsmoosDB(COMMENTS_DB, { debug:false, readOnly:true, processLockMode:'shared', lockMode:'shared' }); db.open(); return db; }
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function safeLs(db, p) { try { return db.fs.ls(p) || []; } catch { return []; } }
function decode(buffer) { try { return legacy.deserializeBinary(buffer); } catch { return JSON.parse(buffer.toString('utf8')); } }
function readObj(db, p) { const st = db.fs.stat(p); if (!st?.exists) return null; const b = db.fs.cat(p); if (!Buffer.isBuffer(b)) return null; try { return decode(b); } catch { return null; } }
function numericKeys(obj) { return Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b)); }
function rows(obj) { return numericKeys(obj).flatMap(k => Array.isArray(obj[k]) ? obj[k] : []); }
function norm(x) { return String(x || '').replace(/\s+/g, ' ').trim(); }
function section(row) { return Number(row?.verseSection ?? row?.dayuh?.verseSection); }
function sub(row) { return Number(row?.subSection ?? row?.dayuh?.subSection); }
function sourceHebrew(row) { return row?.sourceHebrew || row?.dayuh?.sourceHebrew || ''; }
function discoverSeries() { return fs.readdirSync(SERIES_ROOT).filter(n => /^seferHaSichos\d+$/i.test(n)).sort(); }
function aliasesFor(db, sid, pid) { return safeLs(db, `/social/heichelos/ikar/comments/atSeries/${sid}/atPost/${pid}`).sort(); }
function chooseAlias(aliases) { return aliases.includes(ALIAS) ? ALIAS : aliases.includes(`${ALIAS}.awtsmoosJSON`) ? `${ALIAS}.awtsmoosJSON` : null; }
function makeChunks({ seriesId, postId, alias, post, commentRows }) {
  const usable = commentRows.filter(r => norm(r?.content));
  const chunks = [];
  for (let start = 0; start < usable.length; start += Math.max(1, CHUNK_SIZE - OVERLAP)) {
    const slice = usable.slice(start, start + CHUNK_SIZE);
    if (!slice.length) continue;
    const verseStart = section(slice[0]);
    const verseEnd = section(slice.at(-1));
    const commentIds = slice.map(r => r.id).filter(Boolean);
    const english = slice.map(r => norm(r.content)).join(' ');
    chunks.push({
      id: `${seriesId}:${postId}:s${verseStart}-s${verseEnd}:c${start}-${start + slice.length - 1}`,
      seriesId,
      postId,
      aliasId: ALIAS,
      commentPath: `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${alias}`,
      year: Number(seriesId.replace(/\D/g, '')) || null,
      title: post?.title || post?.dayuh?.title || '',
      verseStart,
      verseEnd,
      firstSubSection: sub(slice[0]),
      lastSubSection: sub(slice.at(-1)),
      commentIds,
      firstCommentId: commentIds[0] || '',
      lastCommentId: commentIds.at(-1) || '',
      commentCount: slice.length,
      textPolicy: 'english-comments-only-from-live-db',
      text: english,
      previewEnglish: english.slice(0, 240),
      previewHebrew: norm(sourceHebrew(slice[0])).slice(0, 240)
    });
    if (start + CHUNK_SIZE >= usable.length) break;
  }
  return chunks;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const latestAlignment = fs.readdirSync(RAG)
    .filter(n => n.startsWith('verify_sefer_hasichos_live_alignment_'))
    .sort()
    .at(-1);
  const alignmentPath = latestAlignment ? path.join(RAG, latestAlignment, 'summary.json') : null;
  const alignment = alignmentPath && fs.existsSync(alignmentPath) ? JSON.parse(fs.readFileSync(alignmentPath, 'utf8')) : null;
  if (REQUIRE_CLEAN && alignment && !alignment.readyForEmbedding) {
    throw new Error(`Alignment is not clean. Refusing to prepare embeddings without --allow-dirty. See ${alignmentPath}`);
  }

  const dos = new DosDB(DB_ROOT);
  await dos.init?.();
  const cdb = openCommentsDb();
  const manifest = [];
  const skipped = [];
  try {
    for (const seriesId of discoverSeries()) {
      const posts = await dos.get(`/social/heichelos/ikar/series/${seriesId}/posts`).catch(() => null);
      if (!posts || typeof posts !== 'object' || Array.isArray(posts)) { skipped.push({ seriesId, reason: 'missing_hebrew_posts' }); continue; }
      for (const postId of Object.keys(posts).sort()) {
        const alias = chooseAlias(aliasesFor(cdb, seriesId, postId));
        if (!alias) { skipped.push({ seriesId, postId, reason: 'missing_translation_alias' }); continue; }
        const obj = readObj(cdb, `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${alias}`);
        if (!obj) { skipped.push({ seriesId, postId, alias, reason: 'unreadable_translation_branch' }); continue; }
        const commentRows = rows(obj);
        if (!commentRows.length) { skipped.push({ seriesId, postId, alias, reason: 'zero_comment_rows' }); continue; }
        manifest.push(...makeChunks({ seriesId, postId, alias, post: posts[postId], commentRows }));
      }
    }
  } finally { closeDb(cdb); }

  const manifestJsonl = path.join(OUT_DIR, 'manifest.jsonl');
  const vectorsJsonl = path.join(OUT_DIR, 'vectors.jsonl');
  const summaryPath = path.join(OUT_DIR, 'summary.json');
  fs.writeFileSync(manifestJsonl, manifest.map(x => JSON.stringify(x)).join('\n') + (manifest.length ? '\n' : ''));

  const summary = {
    BH: 'B"H',
    status: RUN_EMBEDDINGS ? 'embedding-run-requested' : 'prepared-not-run',
    outDir: OUT_DIR,
    manifestJsonl,
    vectorsJsonl,
    alignmentPath,
    alignmentReady: alignment?.readyForEmbedding ?? null,
    series: discoverSeries(),
    chunkSize: CHUNK_SIZE,
    overlap: OVERLAP,
    chunks: manifest.length,
    skippedCount: skipped.length,
    skippedSamples: skipped.slice(0, 80),
    textPolicy: 'embeddings are based on raw English comment content only; Hebrew is metadata/preview only',
    runCommand: `cd /Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com && node scripts/comment_rag/prepare_sefer_hasichos_embedding_job.mjs --run-embeddings${REQUIRE_CLEAN ? '' : ' --allow-dirty'}`,
    preparedAt: new Date().toISOString()
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  if (RUN_EMBEDDINGS) {
    const out = fs.createWriteStream(vectorsJsonl, { flags: 'a' });
    for (const item of manifest) {
      const embedded = await embedTextAuto(item.text, { modelRoot: RAG, noFallback: true, fresh: true });
      out.write(JSON.stringify({ ...item, provider: embedded.provider, dimensions: embedded.vector.length, vec: embedded.vector }) + '\n');
    }
    out.end();
  }

  console.log(JSON.stringify(summary, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
