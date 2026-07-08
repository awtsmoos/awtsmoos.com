#!/usr/bin/env node
// B"H
/** Move imported v16-v39 packed comment files from .awtsmoosJSON to extensionless canonical paths. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const DB_FILE = path.join(DB_ROOT, 'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const APPLY = process.argv.includes('--apply');
const VOLUMES = volumesFrom(process.argv.find(arg => arg.startsWith('--volumes='))?.split('=')[1] || '16-39');
const RUN = path.join(RAG, `mv_imported_likkutei_v16_v39_extensionless_${new Date().toISOString().replace(/[:.]/g, '-')}`);

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

function backup() {
  const dir = path.join(RUN, 'backup');
  fs.mkdirSync(dir, { recursive: true });
  const copied = [];
  for (const file of [DB_FILE, `${DB_FILE}.wal`]) {
    if (!fs.existsSync(file)) continue;
    const target = path.join(dir, path.basename(file));
    fs.copyFileSync(file, target);
    copied.push({ from: file, to: target, bytes: fs.statSync(target).size });
  }
  return copied;
}

function walkPosts(db, volume) {
  const base = `/social/heichelos/ikar/comments/atSeries/likkuteiSichosVolume${volume}/atPost`;
  const st = db.fs.stat(base);
  if (!st?.exists || st.type !== 'dir') return [];
  return (db.fs.ls(base) || []).sort().map(postId => ({
    volume,
    postId,
    oldPath: `${base}/${postId}/likkutei_translation_en.awtsmoosJSON`,
    newPath: `${base}/${postId}/likkutei_translation_en`
  }));
}

function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const report = { BH:'B"H', apply:APPLY, run:RUN, volumes:VOLUMES, backup:[], considered:0, moved:0, alreadyExtensionless:0, missingOld:0, targetExists:0, failed:[], samples:[] };
  if (APPLY) report.backup = backup();
  const db = new AwtsmoosDB(DB_FILE, { debug:false });
  db.open();
  try {
    for (const volume of VOLUMES) {
      for (const item of walkPosts(db, volume)) {
        report.considered++;
        const oldStat = db.fs.stat(item.oldPath);
        const newStat = db.fs.stat(item.newPath);
        if (newStat?.exists && !oldStat?.exists) { report.alreadyExtensionless++; continue; }
        if (!oldStat?.exists) { report.missingOld++; continue; }
        if (newStat?.exists) { report.targetExists++; report.failed.push({ ...item, reason:'target_exists' }); continue; }
        if (APPLY) {
          const ok = db.fs.mv(item.oldPath, item.newPath);
          const verify = db.fs.stat(item.newPath);
          if (!ok || !verify?.exists) { report.failed.push({ ...item, reason:'mv_or_verify_failed', ok, verify }); continue; }
        }
        report.moved++;
        if (report.samples.length < 12) report.samples.push(item);
      }
    }
    if (APPLY) { db.fs.flush?.(); db.waitForIdle?.(); }
  } finally {
    db.pager?.close?.(); db.processLock?.release?.();
  }
  fs.writeFileSync(path.join(RUN,'summary.json'), JSON.stringify(report,null,2));
  console.log(JSON.stringify({ apply:report.apply, run:report.run, considered:report.considered, moved:report.moved, alreadyExtensionless:report.alreadyExtensionless, missingOld:report.missingOld, targetExists:report.targetExists, failed:report.failed.length, backup:report.backup, samples:report.samples }, null, 2));
}
main();
