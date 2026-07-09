#!/usr/bin/env node
// B"H
/**
 * @file embed_sefer_hasichos_english_manifest.mjs
 * @chapter The English Breath Alone Enters The Vector Flame
 *
 * Reads the prepared Sefer HaSichos manifest and embeds ONLY item.text.
 * item.text was built from live English comment row.content values.
 * Hebrew fields, previews, and sourceHebrew metadata are never sent to the embedder.
 *
 * This script does not open the live comments DB and cannot modify it.
 * It writes only local artifact files under the embedding-job folder.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { embedTextAuto } = require('../../ayzarim/DosDB/aiSearch/textEmbedRunner.js');

const RAG = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const OUT_DIR = path.join(RAG, 'sefer-hasichos-english-comments-embedding-job');
const MANIFEST = path.join(OUT_DIR, 'manifest.jsonl');
const VECTORS = path.join(OUT_DIR, 'vectors.jsonl');
const FAILURES = path.join(OUT_DIR, 'embedding-failures.jsonl');
const PROGRESS = path.join(OUT_DIR, 'embedding-progress.json');
const MODEL_ROOT = RAG;
const LIMIT = Number(process.env.SHICHOSE_EMBED_LIMIT || 0);
const RESET = process.argv.includes('--reset');
const STOP_ON_ERROR = !process.argv.includes('--continue-on-error');

function readJsonl(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean).map(line => JSON.parse(line));
}
function existingIds(file) {
  const ids = new Set();
  if (!fs.existsSync(file)) return ids;
  for (const line of fs.readFileSync(file, 'utf8').split(/\n/).filter(Boolean)) {
    try { const obj = JSON.parse(line); if (obj.id) ids.add(obj.id); } catch {}
  }
  return ids;
}
function assertEnglishOnly(item) {
  if (typeof item.text !== 'string' || !item.text.trim()) throw new Error(`Missing English text for ${item.id}`);
  const suspectKeys = ['previewHebrew', 'sourceHebrew', 'hebrew', 'dayuh'];
  for (const key of suspectKeys) {
    if (Object.prototype.hasOwnProperty.call(item, key) && key === 'text') throw new Error(`Internal key collision on ${item.id}`);
  }
  return item.text;
}
function writeProgress(data) {
  fs.writeFileSync(PROGRESS, JSON.stringify({ BH: 'B"H', ...data, updatedAt: new Date().toISOString() }, null, 2));
}
function compactRecord(item, embedded) {
  return {
    id: item.id,
    seriesId: item.seriesId,
    postId: item.postId,
    aliasId: item.aliasId,
    commentPath: item.commentPath,
    year: item.year,
    title: item.title,
    verseStart: item.verseStart,
    verseEnd: item.verseEnd,
    firstSubSection: item.firstSubSection,
    lastSubSection: item.lastSubSection,
    commentIds: item.commentIds,
    firstCommentId: item.firstCommentId,
    lastCommentId: item.lastCommentId,
    commentCount: item.commentCount,
    textPolicy: 'english-comments-only-from-manifest-item-text',
    text: item.text,
    previewEnglish: item.previewEnglish,
    provider: embedded.provider,
    realEmbedding: embedded.realEmbedding,
    dimensions: embedded.vector.length,
    vec: embedded.vector
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (RESET) {
    for (const file of [VECTORS, FAILURES, PROGRESS]) if (fs.existsSync(file)) fs.rmSync(file);
  }
  const manifest = readJsonl(MANIFEST);
  const done = existingIds(VECTORS);
  const total = LIMIT ? Math.min(LIMIT, manifest.length) : manifest.length;
  const vectorOut = fs.createWriteStream(VECTORS, { flags: 'a' });
  const failureOut = fs.createWriteStream(FAILURES, { flags: 'a' });
  let completed = done.size;
  let embeddedNow = 0;
  let skippedExisting = 0;
  let failed = 0;
  writeProgress({ phase: 'starting', total, alreadyDone: done.size, vectors: VECTORS, failures: FAILURES });
  try {
    for (let index = 0; index < total; index += 1) {
      const item = manifest[index];
      if (!item?.id) continue;
      if (done.has(item.id)) { skippedExisting += 1; continue; }
      try {
        const englishTextOnly = assertEnglishOnly(item);
        const embedded = await embedTextAuto(englishTextOnly, { modelRoot: MODEL_ROOT, noFallback: true, fresh: true });
        if (!embedded.realEmbedding || !Array.isArray(embedded.vector) || embedded.vector.length !== 384) {
          throw new Error(`Bad embedding shape for ${item.id}: ${embedded.vector?.length}`);
        }
        vectorOut.write(JSON.stringify(compactRecord(item, embedded)) + '\n');
        done.add(item.id);
        embeddedNow += 1;
        completed += 1;
      } catch (error) {
        failed += 1;
        const record = { id: item.id, index, seriesId: item.seriesId, postId: item.postId, textLength: String(item.text || '').length, error: error.stack || String(error), at: new Date().toISOString() };
        failureOut.write(JSON.stringify(record) + '\n');
        if (STOP_ON_ERROR) throw error;
      }
      if (embeddedNow % 10 === 0 || completed === total || failed) {
        writeProgress({ phase: 'embedding', total, completed, embeddedNow, skippedExisting, failed, currentIndex: index, currentId: item.id });
      }
    }
    writeProgress({ phase: failed ? 'completed-with-failures' : 'completed', total, completed, embeddedNow, skippedExisting, failed, vectors: VECTORS, failures: FAILURES });
  } finally {
    await new Promise(resolve => vectorOut.end(resolve));
    await new Promise(resolve => failureOut.end(resolve));
  }
  console.log(JSON.stringify({ BH: 'B"H', total, completed, embeddedNow, skippedExisting, failed, vectors: VECTORS, failures: FAILURES, progress: PROGRESS }, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
