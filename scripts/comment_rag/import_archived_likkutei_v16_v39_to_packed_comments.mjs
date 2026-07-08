#!/usr/bin/env node
// B"H
/**
 * @file import_archived_likkutei_v16_v39_to_packed_comments.mjs
 * @description
 * The archived Likkutei Sichos v16-v39 translation sidecars are binary
 * awtsmoosJSON files outside the live packed comment database. This importer
 * copies them into the official routed packed comment vessel through DosDB, so
 * future semantic search can retrieve snippets from live DB paths.
 *
 * It is deliberately conservative:
 * - dry-run unless --apply is supplied
 * - backs up the official packed comment DB before writes
 * - refuses to overwrite a non-empty live branch unless --overwrite is supplied
 * - verifies every applied write by reading the logical path back and comparing
 *   comment counts and representative comment ids
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const ARCHIVE_ROOT = path.join(RAG, 'all_remaining_likkutei_comment_sidecars_archived_20260707_100732');
const PACKED_DB = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const ALIAS = 'likkutei_translation_en';
const APPLY = process.argv.includes('--apply');
const OVERWRITE = process.argv.includes('--overwrite');
const VOLUMES = volumesFrom(process.argv.find(arg => arg.startsWith('--volumes='))?.split('=')[1] || '16-39');
const RUN = path.join(RAG, `import_archived_likkutei_v16_v39_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function volumesFrom(spec) {
  const out = [];
  for (const part of String(spec || '').split(',')) {
    const trimmed = part.trim();
    const range = trimmed.match(/^(\d+)-(\d+)$/);
    if (range) for (let i = Number(range[1]); i <= Number(range[2]); i += 1) out.push(i);
    else if (trimmed) out.push(Number(trimmed));
  }
  return [...new Set(out)].filter(Number.isFinite).sort((a, b) => a - b);
}

function countComments(obj) {
  return Object.entries(obj || {}).reduce((sum, [key, value]) => {
    return /^\d+$/.test(key) && Array.isArray(value) ? sum + value.length : sum;
  }, 0);
}

function firstCommentId(obj) {
  for (const key of Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b))) {
    const row = obj[key]?.[0];
    if (row?.id) return row.id;
  }
  return '';
}

function lastCommentId(obj) {
  let last = '';
  for (const key of Object.keys(obj || {}).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b))) {
    for (const row of obj[key] || []) if (row?.id) last = row.id;
  }
  return last;
}

function filesForVolume(volume) {
  const seriesId = `likkuteiSichosVolume${volume}`;
  const base = path.join(ARCHIVE_ROOT, 'social/heichelos/ikar/comments/atSeries', seriesId, 'atPost');
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base).sort().map(postId => {
    const file = path.join(base, postId, `${ALIAS}.awtsmoosJSON`);
    return { volume, seriesId, postId, file };
  }).filter(entry => fs.existsSync(entry.file));
}

function readSidecar(file) {
  const obj = legacy.deserializeBinary(fs.readFileSync(file));
  if (!obj || typeof obj !== 'object') throw new Error(`Unreadable sidecar ${file}`);
  return obj;
}

function logicalPath(entry) {
  return `/social/heichelos/ikar/comments/atSeries/${entry.seriesId}/atPost/${entry.postId}/${ALIAS}`;
}

function backupPackedDb() {
  const backupDir = path.join(RUN, 'backup');
  fs.mkdirSync(backupDir, { recursive: true });
  const copied = [];
  for (const file of [PACKED_DB, `${PACKED_DB}.wal`]) {
    if (!fs.existsSync(file)) continue;
    const target = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, target);
    copied.push({ from: file, to: target, bytes: fs.statSync(target).size });
  }
  return copied;
}

function flush(db) {
  const router = db.__awtsmoosDbFsRouter;
  for (const fam of router?.heichelos?.values?.() || []) {
    for (const opened of fam?.dbs?.values?.() || []) opened.fs?.flush?.();
  }
}

async function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const report = {
    BH: 'B"H',
    apply: APPLY,
    overwrite: OVERWRITE,
    run: RUN,
    dbRoot: DB_ROOT,
    archiveRoot: ARCHIVE_ROOT,
    packedDb: PACKED_DB,
    volumes: VOLUMES,
    backup: [],
    filesSeen: 0,
    readable: 0,
    written: 0,
    alreadyPresent: 0,
    skipped: [],
    verified: 0,
    comments: 0,
    samples: []
  };

  const entries = VOLUMES.flatMap(filesForVolume);
  report.filesSeen = entries.length;
  if (APPLY) report.backup = backupPackedDb();

  const db = new DosDB(DB_ROOT);
  await db.init?.();

  for (const entry of entries) {
    const logical = logicalPath(entry);
    let obj;
    try { obj = readSidecar(entry.file); }
    catch (error) {
      report.skipped.push({ path: logical, file: entry.file, reason: 'unreadable_sidecar', error: String(error.message || error) });
      continue;
    }

    const nextComments = countComments(obj);
    if (!nextComments) {
      report.skipped.push({ path: logical, file: entry.file, reason: 'zero_comments' });
      continue;
    }
    report.readable += 1;
    report.comments += nextComments;

    const before = await db.get(logical).catch(() => null);
    const beforeComments = countComments(before);
    if (beforeComments && !OVERWRITE) {
      report.alreadyPresent += 1;
      report.skipped.push({ path: logical, file: entry.file, reason: 'already_present', beforeComments, nextComments });
      continue;
    }

    if (APPLY) {
      await db.write(logical, obj);
      const after = await db.get(logical).catch(() => null);
      const afterComments = countComments(after);
      const ok = afterComments === nextComments && firstCommentId(after) === firstCommentId(obj) && lastCommentId(after) === lastCommentId(obj);
      if (!ok) {
        report.skipped.push({ path: logical, file: entry.file, reason: 'verification_failed', nextComments, afterComments, expectedFirst: firstCommentId(obj), actualFirst: firstCommentId(after), expectedLast: lastCommentId(obj), actualLast: lastCommentId(after) });
        continue;
      }
      report.written += 1;
      report.verified += 1;
    }

    if (report.samples.length < 12) {
      report.samples.push({ volume: entry.volume, path: logical, comments: nextComments, firstCommentId: firstCommentId(obj), lastCommentId: lastCommentId(obj) });
    }
  }

  if (APPLY) flush(db);
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    apply: report.apply,
    overwrite: report.overwrite,
    run: report.run,
    volumes: report.volumes,
    filesSeen: report.filesSeen,
    readable: report.readable,
    written: report.written,
    verified: report.verified,
    alreadyPresent: report.alreadyPresent,
    skipped: report.skipped.length,
    comments: report.comments,
    backup: report.backup,
    samples: report.samples
  }, null, 2));
}

main().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
