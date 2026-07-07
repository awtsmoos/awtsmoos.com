// B"H
/** Rewrite known routed comment branches to extensionless virtual paths and remove old suffix paths. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');

const DB_ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const SEFER_WORK = '/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const RUN = path.join(RAG, `known_comment_extensionless_${new Date().toISOString().replace(/[:.]/g, '-')}`);
function count(obj) { return Object.entries(obj || {}).reduce((n,[k,v]) => /^\d+$/.test(k) && Array.isArray(v) ? n + v.length : n, 0); }
function jsonFiles(dir, prefix) { return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.startsWith(prefix)).map(n => path.join(dir,n,'summary.json')).filter(fs.existsSync) : []; }
function readSummary(file) { try { return JSON.parse(fs.readFileSync(file,'utf8')); } catch { return null; } }
function collectPaths() {
  const out = new Set();
  for (const f of jsonFiles(SEFER_WORK, 'live_content_only_apply_')) {
    const s = readSummary(f); if (!s?.apply) continue;
    for (const w of s.writes || []) if (w.path) out.add(w.path.replace(/\.(awtsmoosJSON|json)$/i,''));
  }
  for (const f of jsonFiles(RAG, 'likkutei_comment_migrate_')) {
    const s = readSummary(f); if (!s?.apply) continue;
    for (const p of s.paths || []) if (p.path) out.add(p.path.replace(/\.(awtsmoosJSON|json)$/i,''));
  }
  return [...out].sort();
}
function flush(db) { const router = db.__awtsmoosDbFsRouter; for (const fam of router?.heichelos?.values?.() || []) for (const opened of fam?.dbs?.values?.() || []) opened.fs?.flush?.(); }
async function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const db = new DosDB(DB_ROOT); await db.init?.();
  const paths = collectPaths();
  const report = { BH:'B"H', run:RUN, paths:paths.length, rewritten:0, deletedOldSuffix:0, skipped:[], samples:[] };
  for (const p of paths) {
    const value = await db.get(p).catch(() => null);
    const comments = count(value);
    if (!comments) { report.skipped.push({ path:p, reason:'empty_or_unreadable' }); continue; }
    const oldSuffix = `${p}.awtsmoosJSON`;
    const beforeOld = await db.get(oldSuffix).catch(() => null);
    await db.write(p, value);
    const after = await db.get(p).catch(() => null);
    const afterComments = count(after);
    if (afterComments !== comments) { report.skipped.push({ path:p, reason:'count_mismatch_after_write', comments, afterComments }); continue; }
    if (count(beforeOld)) {
      const del = await db.delete(oldSuffix, false).catch(() => null);
      if (del !== undefined && del !== false) report.deletedOldSuffix++;
    }
    report.rewritten++;
    if (report.samples.length < 8) report.samples.push({ path:p, comments });
  }
  flush(db);
  fs.writeFileSync(path.join(RUN,'summary.json'), JSON.stringify(report,null,2));
  console.log(JSON.stringify({ run:RUN, paths:report.paths, rewritten:report.rewritten, deletedOldSuffix:report.deletedOldSuffix, skipped:report.skipped.length, samples:report.samples }, null, 2));
}
main().catch(e => { console.error(e.stack || e); process.exit(1); });
