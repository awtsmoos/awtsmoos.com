// B"H
/** Rewrite Likkutei Sichos translation comments into the routed AwtsmoosDB comment tree. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const ALIAS = 'likkutei_translation_en';
const APPLY = process.argv.includes('--apply');
const VOLUMES = (process.env.VOLUMES || process.argv.find(a => a.startsWith('--volumes='))?.split('=')[1] || '1-15');
const RUN = path.join(DB_ROOT, 'ai/comment-rag', `likkutei_comment_migrate_${new Date().toISOString().replace(/[:.]/g, '-')}`);

function vols(spec) {
  const out = [];
  for (const part of spec.split(',')) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) for (let i = Number(m[1]); i <= Number(m[2]); i++) out.push(i);
    else if (part.trim()) out.push(Number(part));
  }
  return [...new Set(out)].filter(Number.isFinite);
}
function countComments(obj) {
  return Object.entries(obj || {}).reduce((n, [k, v]) => /^\d+$/.test(k) && Array.isArray(v) ? n + v.length : n, 0);
}
function safeRead(file) {
  try { const obj = legacy.deserializeBinary(fs.readFileSync(file)); return obj && typeof obj === 'object' ? obj : null; }
  catch { return null; }
}
function filesFor(volume) {
  const seriesId = `likkuteiSichosVolume${volume}`;
  const root = path.join(DB_ROOT, 'social/heichelos/ikar/comments/atSeries', seriesId, 'atPost');
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root).sort().map(postId => ({ volume, seriesId, postId, file: path.join(root, postId, `${ALIAS}.awtsmoosJSON`) })).filter(x => fs.existsSync(x.file));
}
function flush(db) {
  const router = db.__awtsmoosDbFsRouter;
  for (const fam of router?.heichelos?.values?.() || []) for (const opened of fam?.dbs?.values?.() || []) opened.fs?.flush?.();
}
async function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const db = new DosDB(DB_ROOT); await db.init?.();
  const summary = { BH: 'B"H', apply: APPLY, dbRoot: DB_ROOT, volumes: vols(VOLUMES), run: RUN, files: 0, written: 0, skipped: [], comments: 0, paths: [] };
  for (const volume of summary.volumes) for (const entry of filesFor(volume)) {
    summary.files++;
    const obj = safeRead(entry.file);
    const comments = countComments(obj);
    if (!obj || !comments) { summary.skipped.push({ ...entry, reason: 'empty_or_unreadable', comments }); continue; }
    const logical = `/social/heichelos/ikar/comments/atSeries/${entry.seriesId}/atPost/${entry.postId}/${ALIAS}`;
    const before = await db.get(logical).catch(() => null);
    const beforeComments = countComments(before);
    const result = APPLY ? await db.write(logical, obj) : { dryRun: true };
    if (APPLY) summary.written++;
    summary.comments += comments;
    summary.paths.push({ volume, path: logical, beforeComments, nextComments: comments, result: result?.success || result });
  }
  if (APPLY) flush(db);
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ apply: APPLY, run: RUN, volumes: summary.volumes, files: summary.files, written: summary.written, skipped: summary.skipped.length, comments: summary.comments }, null, 2));
}
main().catch(e => { console.error(e.stack || e); process.exit(1); });
