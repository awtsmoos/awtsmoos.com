#!/usr/bin/env node
// B"H
/**
 * @file clean_likkutei_live_database_v01_v39.mjs
 * @description
 * Makes the Likkutei Sichos comment search vessel live-only.
 *
 * This script does not trust caches. It rewrites the v16-v39 archived English
 * translation branches directly into the official packed comments VirtualFs as
 * decoded AwtsmoosJSON objects, verifies those bytes by re-reading the packed
 * DB itself, then audits all v01-v39 fast-index references against live posts
 * and live comments.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const ARCHIVE_ROOT = path.join(RAG, 'all_remaining_likkutei_comment_sidecars_archived_20260707_100732');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const POSTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.posts.fs.awtsdb');
const META_JSONL = path.join(RAG, 'likkutei-v01-v39-fast-index/meta.jsonl');
const ALIAS = 'likkutei_translation_en';
const APPLY = process.argv.includes('--apply');
const RUN = path.join(RAG, `clean_likkutei_live_database_v01_v39_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function countComments(obj) {
  return Object.entries(obj || {}).reduce((sum, [key, value]) => /^\d+$/.test(key) && Array.isArray(value) ? sum + value.length : sum, 0);
}
function allRows(obj) {
  return Object.keys(obj || {}).filter(key => /^\d+$/.test(key)).sort((a, b) => Number(a) - Number(b)).flatMap(key => Array.isArray(obj[key]) ? obj[key] : []);
}
function normalizeText(value) {
  return String(value || '').replace(/<[^>]+>/g, '').replace(/&lt;[^&]*?&gt;/g, '').replace(/\s+/g, ' ').trim();
}
function readArchive(file) {
  return legacy.deserializeBinary(fs.readFileSync(file));
}
function archiveEntries() {
  const out = [];
  const base = path.join(ARCHIVE_ROOT, 'social/heichelos/ikar/comments/atSeries');
  for (let volume = 16; volume <= 39; volume += 1) {
    const seriesId = `likkuteiSichosVolume${volume}`;
    const postRoot = path.join(base, seriesId, 'atPost');
    if (!fs.existsSync(postRoot)) continue;
    for (const postId of fs.readdirSync(postRoot).sort()) {
      const file = path.join(postRoot, postId, `${ALIAS}.awtsmoosJSON`);
      if (!fs.existsSync(file)) continue;
      out.push({ volume, seriesId, postId, file, livePath: `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${ALIAS}` });
    }
  }
  return out;
}
function metaRecords() {
  return fs.readFileSync(META_JSONL, 'utf8').split(/\n/).filter(Boolean).map(line => JSON.parse(line));
}
function uniqueCommentRefs() {
  const refs = new Map();
  for (const record of metaRecords()) {
    if (!refs.has(record.commentPath)) refs.set(record.commentPath, {
      volume: Number(record.volume),
      seriesId: record.seriesId,
      postId: record.postId,
      commentPath: record.commentPath,
      chunks: 0,
      expectedIds: new Set()
    });
    const ref = refs.get(record.commentPath);
    ref.chunks += 1;
    for (const id of record.commentIds || []) ref.expectedIds.add(id);
  }
  return [...refs.values()].sort((a, b) => a.volume - b.volume || a.commentPath.localeCompare(b.commentPath));
}
function backup(file, dir) {
  const copied = [];
  for (const item of [file, `${file}.wal`]) {
    if (!fs.existsSync(item)) continue;
    const target = path.join(dir, path.basename(item));
    fs.copyFileSync(item, target);
    copied.push({ from: item, to: target, bytes: fs.statSync(target).size });
  }
  return copied;
}
function openDb(file, readOnly = false) {
  const db = new AwtsmoosDB(file, readOnly ? { debug:false, readOnly:true, processLockMode:'shared', lockMode:'shared' } : { debug:false });
  db.open();
  return db;
}
function closeDb(db) {
  try { db.fs?.flush?.(); db.waitForIdle?.(); } catch {}
  try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
}
function readCommentBranch(commentsDb, livePath) {
  const stat = commentsDb.fs.stat(livePath);
  if (!stat?.exists) return { ok:false, reason:'missing' };
  const buf = commentsDb.fs.cat(livePath);
  if (!Buffer.isBuffer(buf)) return { ok:false, reason:'not_buffer', valueType:typeof buf };
  try {
    const obj = legacy.deserializeBinary(buf);
    return { ok:true, obj, rows: allRows(obj), comments: countComments(obj), bytes: buf.length };
  } catch (error) {
    return { ok:false, reason:'deserialize_failed', error:String(error.message || error), bytes:buf.length, firstBytes:Array.from(buf.subarray(0,12)) };
  }
}
function postMapFor(postsDb, seriesId) {
  const p = `/social/heichelos/ikar/series/${seriesId}/posts`;
  const stat = postsDb.fs.stat(p);
  if (!stat?.exists) return null;
  const buf = postsDb.fs.cat(p);
  try { return legacy.deserializeBinary(buf); }
  catch { try { return JSON.parse(buf.toString('utf8')); } catch { return null; } }
}
function auditRef(ref, commentsDb, postsDb, postMaps) {
  const branch = readCommentBranch(commentsDb, ref.commentPath);
  const out = { ...ref, expectedIds: ref.expectedIds.size, liveComments: branch.comments || 0, liveOk: branch.ok, issue: null };
  if (!branch.ok || !branch.comments) { out.issue = branch.reason || 'no_live_comments'; return out; }
  let missingIds = 0;
  const liveIds = new Set(branch.rows.map(row => row?.id).filter(Boolean));
  for (const id of ref.expectedIds) if (!liveIds.has(id)) missingIds += 1;
  out.missingIndexedCommentIds = missingIds;

  let postMap = postMaps.get(ref.seriesId);
  if (!postMap) {
    postMap = postMapFor(postsDb, ref.seriesId);
    postMaps.set(ref.seriesId, postMap);
  }
  const post = postMap?.[ref.postId];
  out.hebrewPostExists = Boolean(post);
  out.postSections = Array.isArray(post?.dayuh?.sections) ? post.dayuh.sections.length : 0;
  out.rowsWithEnglish = 0;
  out.rowsWithHebrew = 0;
  out.rowsMatchingHebrewSlot = 0;
  out.rowsChecked = branch.rows.length;
  for (const row of branch.rows) {
    const en = normalizeText(row?.content);
    const he = normalizeText(row?.sourceHebrew || row?.dayuh?.sourceHebrew);
    if (en) out.rowsWithEnglish += 1;
    if (he) out.rowsWithHebrew += 1;
    const section = Number(row?.verseSection ?? row?.dayuh?.verseSection);
    const sub = Number(row?.subSection ?? row?.dayuh?.subSection);
    const postHe = normalizeText(post?.dayuh?.sections?.[section]?.[sub]);
    if (he && postHe && he === postHe) out.rowsMatchingHebrewSlot += 1;
  }
  if (!out.hebrewPostExists) out.issue = 'missing_hebrew_post';
  else if (!out.postSections) out.issue = 'missing_hebrew_sections';
  else if (missingIds) out.issue = 'missing_indexed_comment_ids';
  else if (out.rowsWithEnglish !== out.rowsChecked) out.issue = 'blank_english_rows';
  else if (out.rowsWithHebrew !== out.rowsChecked) out.issue = 'blank_hebrew_rows';
  else if (out.rowsMatchingHebrewSlot !== out.rowsChecked) out.issue = 'hebrew_slot_mismatch';
  return out;
}

async function main() {
  fs.mkdirSync(RUN, { recursive:true });
  const backupDir = path.join(RUN, 'backup');
  fs.mkdirSync(backupDir, { recursive:true });
  const report = { BH:'B"H', apply:APPLY, run:RUN, backups:[], import: {}, audit: {} };
  if (APPLY) report.backups.push(...backup(COMMENTS_DB, backupDir));

  const entries = archiveEntries();
  const commentsDb = openDb(COMMENTS_DB, false);
  const importSamples = [];
  let archiveReadable = 0, archiveWithComments = 0, written = 0, verified = 0, zeroArchive = 0, unreadableArchive = 0;
  try {
    for (const entry of entries) {
      let obj;
      try { obj = readArchive(entry.file); archiveReadable += 1; }
      catch { unreadableArchive += 1; continue; }
      const comments = countComments(obj);
      if (!comments) { zeroArchive += 1; continue; }
      archiveWithComments += 1;
      const buffer = legacy.serializeJSON(obj);
      if (APPLY) {
        if (commentsDb.fs.stat(entry.livePath)?.exists) commentsDb.fs.rm(entry.livePath);
        commentsDb.fs.write(entry.livePath, buffer);
        written += 1;
      }
      const check = APPLY ? readCommentBranch(commentsDb, entry.livePath) : { ok:true, comments };
      if (check.ok && check.comments === comments) verified += 1;
      else if (importSamples.length < 20) importSamples.push({ ...entry, comments, verify: check });
      if (importSamples.length < 12 && APPLY) importSamples.push({ volume: entry.volume, postId: entry.postId, comments, bytes: buffer.length, livePath: entry.livePath });
    }
    if (APPLY) commentsDb.fs.flush?.();
  } finally { closeDb(commentsDb); }
  report.import = { entries:entries.length, archiveReadable, archiveWithComments, zeroArchive, unreadableArchive, written, verified, samples:importSamples.slice(0,12) };

  const commentsRead = openDb(COMMENTS_DB, true);
  const postsRead = openDb(POSTS_DB, true);
  const postMaps = new Map();
  const refs = uniqueCommentRefs();
  const refsByVolume = new Map();
  const issues = [];
  const volumeStats = new Map();
  try {
    for (const ref of refs) {
      const audited = auditRef(ref, commentsRead, postsRead, postMaps);
      const vol = audited.volume;
      if (!volumeStats.has(vol)) volumeStats.set(vol, { volume:vol, refs:0, liveRefs:0, posts:0, comments:0, indexedIds:0, missingIndexedIds:0, rows:0, rowsWithEnglish:0, rowsWithHebrew:0, rowsMatchingHebrewSlot:0, issues:0 });
      const s = volumeStats.get(vol);
      s.refs += 1;
      s.liveRefs += audited.liveOk && audited.liveComments ? 1 : 0;
      s.posts += audited.hebrewPostExists ? 1 : 0;
      s.comments += audited.liveComments || 0;
      s.indexedIds += audited.expectedIds || 0;
      s.missingIndexedIds += audited.missingIndexedCommentIds || 0;
      s.rows += audited.rowsChecked || 0;
      s.rowsWithEnglish += audited.rowsWithEnglish || 0;
      s.rowsWithHebrew += audited.rowsWithHebrew || 0;
      s.rowsMatchingHebrewSlot += audited.rowsMatchingHebrewSlot || 0;
      if (audited.issue) { s.issues += 1; if (issues.length < 200) issues.push(audited); }
      if (!refsByVolume.has(vol)) refsByVolume.set(vol, 0);
      refsByVolume.set(vol, refsByVolume.get(vol) + 1);
    }
  } finally { closeDb(commentsRead); closeDb(postsRead); }
  const volumes = [...volumeStats.values()].sort((a,b)=>a.volume-b.volume);
  report.audit = {
    refs: refs.length,
    volumesPresent: volumes.map(v => v.volume),
    volumesCount: volumes.length,
    all39VolumesPresent: volumes.length === 39 && volumes[0]?.volume === 1 && volumes.at(-1)?.volume === 39,
    totalLiveComments: volumes.reduce((n,v)=>n+v.comments,0),
    totalRows: volumes.reduce((n,v)=>n+v.rows,0),
    totalIssues: volumes.reduce((n,v)=>n+v.issues,0),
    volumeStats: volumes,
    issueSamples: issues
  };
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => { console.error(error.stack || error); process.exit(1); });
