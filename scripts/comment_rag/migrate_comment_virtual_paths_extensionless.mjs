// B"H
/** Move routed comment virtual files from *.awtsmoosJSON names to extensionless names. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const ROOT = process.env.AWTS_DB_ROOT || '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const PACKED = path.join(ROOT, 'socialPacked');
const APPLY = process.argv.includes('--apply');
const RUN = path.join(ROOT, 'ai/comment-rag', `comment_extensionless_migrate_${new Date().toISOString().replace(/[:.]/g, '-')}`);
function commentShardFiles() { return fs.readdirSync(PACKED).filter(n => /^social\.heichel\..*\.comments.*\.fs\.awtsdb$/.test(n)).map(n => path.join(PACKED, n)); }
function isDir(db, p) { return db.fs.stat(p)?.type === 'dir'; }
function isFile(db, p) { return db.fs.stat(p)?.type === 'file'; }
function children(db, p) { try { return db.fs.ls(p) || []; } catch { return []; } }
function join(a,b){ return (a === '/' ? '' : a) + '/' + b; }
function walkFiles(db, start) { const out=[]; function rec(p){ for(const name of children(db,p)){ const child=join(p,name); const st=db.fs.stat(child); if(st?.type==='dir') rec(child); else if(st?.type==='file') out.push(child); } } if(isDir(db,start)) rec(start); return out; }
function canonical(p) { return p.replace(/\.awtsmoosJSON$/i, '').replace(/\.json$/i, ''); }
async function main() {
  fs.mkdirSync(RUN, { recursive: true });
  const summary = { BH:'B"H', apply: APPLY, run: RUN, shards: [], moved: 0, skipped: [] };
  for (const file of commentShardFiles()) {
    const backup = path.join(RUN, path.basename(file) + '.before');
    if (APPLY) fs.copyFileSync(file, backup);
    const db = new AwtsmoosDB(file, { debug: false });
    await db.open();
    const files = walkFiles(db, '/social').filter(p => /\.awtsmoosJSON$/i.test(p) && /\/comments\//.test(p));
    const shard = { file, backup: APPLY ? backup : null, candidates: files.length, moved: 0 };
    for (const oldPath of files) {
      const nextPath = canonical(oldPath);
      const oldStat = db.fs.stat(oldPath);
      const nextStat = db.fs.stat(nextPath);
      if (nextStat?.exists && nextStat.type === 'file') {
        summary.skipped.push({ file, oldPath, nextPath, reason: 'target_exists' });
        continue;
      }
      if (APPLY) db.fs.mv(oldPath, nextPath);
      shard.moved++; summary.moved++;
    }
    if (APPLY) db.fs.flush?.();
    db.pager?.close?.(); db.processLock?.release?.();
    summary.shards.push(shard);
  }
  fs.writeFileSync(path.join(RUN, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ apply: APPLY, run: RUN, shards: summary.shards.length, moved: summary.moved, skipped: summary.skipped.length }, null, 2));
}
main().catch(e => { console.error(e.stack || e); process.exit(1); });
