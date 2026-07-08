#!/usr/bin/env node
// B"H
/** Repair Sefer HaSichos live structure, preserving data and never inventing English. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const SERIES_ROOT = path.join(DB_ROOT, 'social/heichelos/ikar/series');
const LOOSE_POSTS_ROOT = path.join(DB_ROOT, 'social/heichelos/ikar/posts');
const COMMENTS_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const ALIAS = 'sefer_hasichos_translation_en';
const APPLY = process.argv.includes('--apply');
const RUN = path.join(RAG, `repair_sefer_hasichos_live_alignment_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function decodeFile(file) {
  const buffer = fs.readFileSync(file);
  try { return JSON.parse(buffer.toString('utf8')); } catch {}
  return legacy.deserializeBinary(buffer);
}
function decodeBuffer(buffer) {
  try { return legacy.deserializeBinary(buffer); } catch {}
  try { return JSON.parse(buffer.toString('utf8')); } catch {}
  return null;
}
function seriesIds() {
  return fs.readdirSync(SERIES_ROOT).filter(name => /^seferHaSichos\d+$/i.test(name)).sort();
}
function backupFile(file) {
  if (!fs.existsSync(file)) return null;
  const target = path.join(RUN, 'backup', file.replace(DB_ROOT, '').replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(file, target, { recursive: true, force: true });
  return { from: file, to: target };
}
function postFilesFor(seriesId) {
  const out = new Map();
  const roots = [LOOSE_POSTS_ROOT, path.join(SERIES_ROOT, seriesId, 'posts')];
  for (const root of roots) {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) continue;
    for (const name of fs.readdirSync(root).filter(n => n.startsWith(`${seriesId}_`) && n.endsWith('.awtsmoosJSON')).sort()) {
      out.set(name.replace(/\.awtsmoosJSON$/, ''), path.join(root, name));
    }
  }
  return [...out.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, file]) => ({ id, file }));
}
function buildPostsMap(seriesId) {
  const map = {};
  const errors = [];
  for (const { id, file } of postFilesFor(seriesId)) {
    try { map[id] = decodeFile(file); }
    catch (error) { errors.push({ id, file, error: String(error.message || error) }); }
  }
  return { map, errors };
}
function openCommentsDb() {
  const db = new AwtsmoosDB(COMMENTS_DB, { debug: false });
  db.open();
  return db;
}
function closeDb(db) {
  try { db.fs?.flush?.(); db.waitForIdle?.(); } catch {}
  try { db.pager?.close?.(); db.processLock?.release?.(); } catch {}
}
function safeLs(db, p) { try { return db.fs.ls(p) || []; } catch { return []; } }
function safeStat(db, p) { try { return db.fs.stat(p); } catch { return null; } }
function readPacked(db, p) {
  if (!safeStat(db, p)?.exists) return null;
  const buffer = db.fs.cat(p);
  return Buffer.isBuffer(buffer) ? decodeBuffer(buffer) : null;
}
function rowCount(obj) {
  return Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).reduce((n, k) => n + (Array.isArray(obj[k]) ? obj[k].length : 0), 0);
}
function canonicalize(db, seriesId) {
  const base = `/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost`;
  const postIds = safeLs(db, base).filter(name => !name.endsWith('.awtsmoosJSON')).sort();
  const stat = { seriesId, posts: postIds.length, canonicalAlready: 0, canonicalWritten: 0, noSource: 0, zeroSourceRows: 0, samples: [] };
  for (const postId of postIds) {
    const dir = `${base}/${postId}`;
    const canonical = `${dir}/${ALIAS}`;
    if (rowCount(readPacked(db, canonical))) { stat.canonicalAlready += 1; continue; }
    const aliases = safeLs(db, dir).sort();
    const sourceAlias = aliases.find(a => a === `${ALIAS}.awtsmoosJSON`) || aliases.find(a => a.includes('translation_en'));
    if (!sourceAlias) { stat.noSource += 1; continue; }
    const sourcePath = `${dir}/${sourceAlias}`;
    const sourceObj = readPacked(db, sourcePath);
    const rows = rowCount(sourceObj);
    if (!rows) {
      stat.zeroSourceRows += 1;
      if (stat.samples.length < 20) stat.samples.push({ postId, sourceAlias, rows });
      continue;
    }
    if (APPLY) {
      if (safeStat(db, canonical)?.exists) db.fs.rm(canonical);
      db.fs.write(canonical, legacy.serializeJSON(sourceObj));
    }
    stat.canonicalWritten += 1;
    if (stat.samples.length < 20) stat.samples.push({ postId, sourceAlias, rows, canonical });
  }
  return stat;
}

async function main() {
  fs.mkdirSync(path.join(RUN, 'backup'), { recursive: true });
  const report = { BH: 'B"H', apply: APPLY, run: RUN, backups: [], series: [], commentCanonicalization: [], notes: [] };
  if (APPLY) {
    for (const maybe of [backupFile(COMMENTS_DB), backupFile(`${COMMENTS_DB}.wal`)]) if (maybe) report.backups.push(maybe);
  }
  for (const seriesId of seriesIds()) {
    const seriesDir = path.join(SERIES_ROOT, seriesId);
    const postsDir = path.join(seriesDir, 'posts');
    const postsJson = path.join(seriesDir, 'posts.awtsmoosJSON');
    const { map, errors } = buildPostsMap(seriesId);
    const stat = { seriesId, sourcePostFiles: Object.keys(map).length, decodeErrors: errors, wrotePostsJson: false, movedShadowDir: false, shadowDirBackup: null };
    if (APPLY && Object.keys(map).length) {
      const backup = backupFile(postsJson);
      if (backup) report.backups.push(backup);
      fs.writeFileSync(postsJson, JSON.stringify(map, null, 2));
      stat.wrotePostsJson = true;
      if (fs.existsSync(postsDir) && fs.statSync(postsDir).isDirectory()) {
        const target = path.join(seriesDir, `posts.shadow-dir-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`);
        fs.renameSync(postsDir, target);
        stat.movedShadowDir = true;
        stat.shadowDirBackup = target;
      }
    }
    report.series.push(stat);
  }
  const db = openCommentsDb();
  try {
    for (const seriesId of seriesIds()) report.commentCanonicalization.push(canonicalize(db, seriesId));
  } finally { closeDb(db); }
  report.notes.push('No fake English generated. 5748 remains missing unless real English source is found.');
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error.stack || error); process.exit(1); });
