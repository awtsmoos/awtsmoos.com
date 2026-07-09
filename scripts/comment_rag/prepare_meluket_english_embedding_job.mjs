#!/usr/bin/env node
// B"H
/**
 * @file prepare_meluket_english_embedding_job.mjs
 * @description
 * The Meluket comments, born as careful English vessels beside each Rebbe
 * subsection, are gathered into semantic-search chunks. This script does not
 * call an embedder. It reads the authoritative AwtsmoosDB comments FS, verifies
 * the imported counts against the saved import report, and writes a manifest
 * for the resumable embedding workers.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(ROOT, 'ai/comment-rag');
const JOB = path.join(RAG, 'meluket-english-comments-embedding-job');
const COMMENTS_DB = path.join(ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const IMPORT_REPORT = process.env.MELUKET_IMPORT_REPORT || '/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job/generated/meluket-comment-import/run-report.json';
const ALIAS = 'meluket_translation_en';
const CHUNK_SIZE = Number(process.env.MELUKET_CHUNK_SIZE || 18);
const OVERLAP = Number(process.env.MELUKET_CHUNK_OVERLAP || 3);

function openDb() {
  const db = new AwtsmoosDB(COMMENTS_DB, { compression: false, reuseFreedSpace: 'verified', readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
  db.open();
  return db;
}
function closeDb(db) { try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
function norm(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
function hasHebrew(text) { return /[\u0590-\u05ff]/.test(String(text || '')); }
function stripHebrewForEmbedding(text) { return String(text || '').replace(/[\u0590-\u05ff]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function readVirtualObject(db, virtualPath) {
  const stat = db.fs.stat(virtualPath);
  if (!stat?.exists || stat.type !== 'file' || !stat.size) return null;
  return awts.deserializeBinary(db.fs.readRange(virtualPath, 0, stat.size));
}
function allRows(obj) {
  const out = [];
  for (const [verseSection, rows] of Object.entries(obj || {}).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) out.push({ ...row, verseSection: String(row.verseSection ?? row.dayuh?.verseSection ?? verseSection) });
  }
  return out;
}
function rowOrder(row) {
  const sub = row.dayuh?.subSection;
  if (sub === 'summary') return -1;
  const n = Number(sub);
  return Number.isFinite(n) ? n : 999999;
}
function chunkRows(rows) {
  const usable = rows.filter(row => norm(row.content));
  const chunks = [];
  for (let start = 0; start < usable.length; start += Math.max(1, CHUNK_SIZE - OVERLAP)) {
    const slice = usable.slice(start, start + CHUNK_SIZE);
    if (!slice.length) continue;
    chunks.push(slice);
    if (start + CHUNK_SIZE >= usable.length) break;
  }
  return chunks;
}
function rowKindCounts(rows) {
  return {
    translations: rows.filter(row => row.dayuh?.kind === 'translation').length,
    summaries: rows.filter(row => row.dayuh?.kind === 'sectionSummaryBrief').length,
    sections: new Set(rows.map(row => String(row.verseSection ?? row.dayuh?.verseSection))).size
  };
}
function makeId({ seriesId, postId, startRow, endRow, index }) {
  return `meluket:${seriesId}:${postId}:chunk-${index}:rows-${startRow}-${endRow}`;
}
function makeChunk({ file, rows, slice, index, startRow }) {
  const endRow = startRow + slice.length - 1;
  const verseStart = String(slice[0].verseSection ?? slice[0].dayuh?.verseSection ?? '');
  const verseEnd = String(slice.at(-1).verseSection ?? slice.at(-1).dayuh?.verseSection ?? '');
  const commentIds = slice.map(row => row.id).filter(Boolean);
  const text = slice.map(row => norm(row.content)).join(' ');
  return {
    id: makeId({ seriesId: file.seriesId, postId: file.postId, startRow, endRow, index }),
    seriesId: file.seriesId,
    postId: file.postId,
    aliasId: ALIAS,
    commentPath: `/social/heichelos/ikar/comments/atSeries/${file.seriesId}/atPost/${file.postId}/${ALIAS}`,
    title: file.title || '',
    verseStart,
    verseEnd,
    firstSubSection: slice[0].dayuh?.subSection,
    lastSubSection: slice.at(-1).dayuh?.subSection,
    commentIds,
    firstCommentId: commentIds[0] || '',
    lastCommentId: commentIds.at(-1) || '',
    commentCount: slice.length,
    rowStart: startRow,
    rowEnd: endRow,
    textPolicy: 'meluket-english-comments-from-awtsmoosdb-comment-tree',
    text,
    embeddingText: stripHebrewForEmbedding(text),
    previewEnglish: text.slice(0, 240)
  };
}
function loadReport() {
  if (!fs.existsSync(IMPORT_REPORT)) throw new Error(`Missing import report: ${IMPORT_REPORT}`);
  return JSON.parse(fs.readFileSync(IMPORT_REPORT, 'utf8'));
}
function readPostRows(db, file) {
  const virtualPath = `${file.path}`;
  const obj = readVirtualObject(db, virtualPath);
  if (!obj) throw new Error(`Missing comment alias file ${virtualPath}`);
  return allRows(obj).sort((a, b) => Number(a.verseSection) - Number(b.verseSection) || rowOrder(a) - rowOrder(b));
}
function main() {
  fs.mkdirSync(JOB, { recursive: true });
  const report = loadReport();
  const manifest = [];
  const postReports = [];
  const problems = [];
  let totalTranslations = 0;
  let totalSummaries = 0;
  const db = openDb();
  try {
    for (const file of report.files || []) {
      const rows = readPostRows(db, file);
      const counts = rowKindCounts(rows);
      totalTranslations += counts.translations;
      totalSummaries += counts.summaries;
      if (counts.translations !== file.translations || counts.summaries !== file.summaries || counts.sections !== file.sections) {
        problems.push({ seriesId: file.seriesId, postId: file.postId, expected: { translations: file.translations, summaries: file.summaries, sections: file.sections }, actual: counts });
      }
      const chunks = chunkRows(rows);
      chunks.forEach((slice, index) => manifest.push(makeChunk({ file, rows, slice, index, startRow: index * Math.max(1, CHUNK_SIZE - OVERLAP) })));
      postReports.push({ seriesId: file.seriesId, postId: file.postId, title: file.title, rows: rows.length, chunks: chunks.length, ...counts });
    }
  } finally { closeDb(db); }
  const hebrewChunks = manifest.filter(row => hasHebrew(row.text)).map(row => row.id);
  const emptyEmbeddingChunks = manifest.filter(row => !row.embeddingText).map(row => row.id);
  const manifestPath = path.join(JOB, 'manifest.jsonl');
  const summaryPath = path.join(JOB, 'summary.json');
  fs.writeFileSync(manifestPath, manifest.map(row => JSON.stringify(row)).join('\n') + (manifest.length ? '\n' : ''));
  const summary = {
    BH: 'B"H',
    status: problems.length || emptyEmbeddingChunks.length ? 'prepared-with-problems' : 'prepared-clean',
    job: JOB,
    manifest: manifestPath,
    commentsDb: COMMENTS_DB,
    importReport: IMPORT_REPORT,
    aliasId: ALIAS,
    chunkSize: CHUNK_SIZE,
    overlap: OVERLAP,
    posts: postReports.length,
    chunks: manifest.length,
    translations: totalTranslations,
    summaries: totalSummaries,
    expectedTranslations: report.translations,
    expectedSummaries: report.summaries,
    problems,
    hebrewChunks: hebrewChunks.slice(0, 20),
    hebrewChunksNote: 'Full stored text may include Hebrew; embeddingText strips Hebrew Unicode only for the embedder.',
    emptyEmbeddingChunks: emptyEmbeddingChunks.slice(0, 20),
    postSamples: postReports.slice(0, 10),
    runCommand: `cd ${process.cwd()} && MELUKET_EMBED_WORKERS=2 node scripts/comment_rag/embed_meluket_english_manifest_simple.mjs`,
    preparedAt: new Date().toISOString()
  };
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  if (problems.length || emptyEmbeddingChunks.length) process.exit(2);
}
main();
