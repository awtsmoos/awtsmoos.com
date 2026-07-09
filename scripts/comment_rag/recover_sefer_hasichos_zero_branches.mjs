#!/usr/bin/env node
// B"H
/** Restore real non-empty Sefer HaSichos comment branches for zero/unreadable live aliases. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const WORK = '/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work';
const ALIAS = 'sefer_hasichos_translation_en';
const APPLY = process.argv.includes('--apply');
const RUN = path.join(RAG, `recover_sefer_hasichos_zero_branches_${new Date().toISOString().replace(/[:.]/g, '-')}`);
const TARGETS = [
  ['seferHaSichos5747','seferHaSichos5747_009_9ec850d6'],
  ['seferHaSichos5747','seferHaSichos5747_014_e43867da'],
  ['seferHaSichos5747','seferHaSichos5747_023_82d28df1'],
  ['seferHaSichos5749','seferHaSichos5749_028_590382ef'],
  ['seferHaSichos5750','seferHaSichos5750_006_d4121073'],
  ['seferHaSichos5750','seferHaSichos5750_030_0cf9406f'],
  ['seferHaSichos5750','seferHaSichos5750_038_217e948a'],
  ['seferHaSichos5751','seferHaSichos5751_055_5a53987d'],
  ['seferHaSichos5752','seferHaSichos5752_004_dc7b4882'],
  ['seferHaSichos5752','seferHaSichos5752_012_e569dc23'],
  ['seferHaSichos5752','seferHaSichos5752_025_c38c7dca']
];
function normalize(x) { return String(x || '').replace(/<[^>]+>/g, '').replace(/&lt;[^&]*?&gt;/g, '').replace(/\s+/g, ' ').trim(); }
function rows(branch) { return Object.keys(branch || {}).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b)).flatMap(k => Array.isArray(branch[k]) ? branch[k] : []); }
function postHebrewAt(post, sec, sub) {
  const section = post?.dayuh?.sections?.[sec];
  if (!Array.isArray(section)) return '';
  for (const idx of [sub - 1, sub]) if (idx >= 0 && idx < section.length) { const t = normalize(section[idx]); if (t) return t; }
  return '';
}
function audit(branch, post) {
  const rs = rows(branch);
  let en = 0, he = 0, slot = 0;
  for (const row of rs) {
    const e = normalize(row.content);
    const h = normalize(row.dayuh?.sourceHebrew || row.sourceHebrew);
    if (e) en++;
    if (h) he++;
    const sec = Number(row.verseSection ?? row.dayuh?.verseSection);
    const sub = Number(row.subSection ?? row.dayuh?.subSection);
    if (h && postHebrewAt(post, sec, sub) === h) slot++;
  }
  return { rows: rs.length, withEnglish: en, withHebrew: he, slotMatch: slot };
}
function backupFile(file) {
  if (!fs.existsSync(file)) return null;
  const target = path.join(RUN, 'backup', file.replace(DB_ROOT, '').replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(file, target);
  return { from: file, to: target, bytes: fs.statSync(target).size };
}
function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, out);
    else out.push(p);
  }
  return out;
}
function findBackupJson(pid) {
  const files = walkFiles(WORK).filter(f => f.endsWith('.json') && f.includes(pid));
  return files.find(f => f.includes('comments.before.json')) || files[0] || null;
}
function branchFromAny(value) {
  if (!value || typeof value !== 'object') return null;
  if (rows(value).length) return value;
  const branch = {};
  const addRow = row => {
    if (!row || typeof row !== 'object' || !row.content) return;
    const key = String(row.verseSection ?? row.dayuh?.verseSection ?? '0');
    if (!branch[key]) branch[key] = [];
    branch[key].push(row);
  };
  const sections = value.sections || value.comments || value.items || value.rows;
  if (Array.isArray(sections)) {
    for (const sec of sections) Array.isArray(sec) ? sec.forEach(addRow) : addRow(sec);
  } else if (sections && typeof sections === 'object') {
    for (const key of Object.keys(sections)) {
      const sec = sections[key];
      Array.isArray(sec) ? sec.forEach(addRow) : addRow(sec);
    }
  }
  return rows(branch).length ? branch : null;
}
function extractFromBundle(seriesId, pid) {
  const bundle = path.join(WORK, `comment_bundle_${seriesId.replace('seferHaSichos','')}_content_only.json`);
  if (!fs.existsSync(bundle)) return null;
  const obj = JSON.parse(fs.readFileSync(bundle, 'utf8'));
  const candidates = [];
  function collect(x) {
    if (!x || typeof x !== 'object') return;
    if (x.postId === pid || x.parentId === pid || String(x.path || '').includes(pid)) candidates.push(x);
    if (Array.isArray(x)) x.forEach(collect);
    else for (const k of Object.keys(x)) collect(x[k]);
  }
  collect(obj.paths || obj.comments || obj);
  for (const candidate of candidates) {
    const branch = branchFromAny(candidate);
    if (branch) return { branch, source: bundle };
  }
  return null;
}
function sourceBranch(seriesId, pid) {
  const file = findBackupJson(pid);
  if (file) {
    const branch = branchFromAny(JSON.parse(fs.readFileSync(file, 'utf8')));
    if (branch) return { branch, source: file };
  }
  return extractFromBundle(seriesId, pid);
}
function openDb() { const db = new AwtsmoosDB(COMMENTS_DB, { debug:false }); db.open(); return db; }
function closeDb(db) { try { db.fs?.flush?.(); db.waitForIdle?.(); } catch {} try { db.pager?.close?.(); db.processLock?.release?.(); } catch {} }
async function main() {
  fs.mkdirSync(path.join(RUN, 'backup'), { recursive: true });
  const dos = new DosDB(DB_ROOT);
  await dos.init?.();
  const postsCache = new Map();
  const report = { BH:'B"H', apply: APPLY, run: RUN, backups: [], recovered: 0, verified: 0, targets: [], failures: [] };
  if (APPLY) for (const b of [backupFile(COMMENTS_DB), backupFile(`${COMMENTS_DB}.wal`)]) if (b) report.backups.push(b);
  const db = openDb();
  try {
    for (const [seriesId, postId] of TARGETS) {
      if (!postsCache.has(seriesId)) postsCache.set(seriesId, await dos.get(`/social/heichelos/ikar/series/${seriesId}/posts`).catch(() => null));
      const post = postsCache.get(seriesId)?.[postId];
      const src = sourceBranch(seriesId, postId);
      if (!post || !src) { report.failures.push({ seriesId, postId, reason: !post ? 'missing_post' : 'missing_source' }); continue; }
      const a = audit(src.branch, post);
      if (!a.rows || a.rows !== a.withEnglish || a.rows !== a.withHebrew || a.rows !== a.slotMatch) { report.failures.push({ seriesId, postId, reason: 'source_alignment_failed', audit: a, source: src.source }); continue; }
      const commentPath = `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/${ALIAS}`;
      if (APPLY) {
        if (db.fs.stat(commentPath)?.exists) db.fs.rm(commentPath);
        db.fs.write(commentPath, legacy.serializeJSON(src.branch));
        report.recovered++;
        const after = legacy.deserializeBinary(db.fs.cat(commentPath));
        const va = audit(after, post);
        if (va.rows === a.rows && va.withEnglish === a.rows && va.withHebrew === a.rows && va.slotMatch === a.rows) report.verified++;
        else report.failures.push({ seriesId, postId, reason: 'postwrite_verify_failed', expected: a, actual: va });
      }
      report.targets.push({ seriesId, postId, source: src.source, audit: a, commentPath });
    }
    if (APPLY) db.fs.flush?.();
  } finally { closeDb(db); }
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
