// B"H
/**
 * @module SocialRagShards
 * @description Every corpus is a lane of one highway: Likkutei Sichos, Meluket,
 * and Sefer HaSichos reveal themselves from live packed AwtsmoosDB shards.
 */
const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { ragRoot, existingJson, stat } = require('./paths.js');
function slug(name) { return path.basename(name, '.awtsdb').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase(); }
function label(s) { return s.replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase()); }
function aliases(id) {
  const out = [id];
  if (id.includes('meluket')) out.push('meluket', 'maamar-meluket');
  if (id.includes('hasichos')) out.push('sefer-hasichos', 'dvar-hasichos', 'dr-hasichos');
  if (id.includes('likkutei')) out.push('likkutei-sichos', 'likutei-sichos', 'ls');
  return [...new Set(out)];
}
function rowsOf(list) { const plain = list?.__resolve__?.(); return Array.isArray(plain) ? plain : Array.from({ length: Number(list?.length || 0) }, (_, i) => list[i]); }
async function inspectShard(file) {
  const db = new AwtsmoosDB(file, { debug: false, wal: false, readOnly: true, processLockMode: 'shared', lockMode: 'shared' });
  await db.open();
  try {
    const names = Object.keys(db.root).filter(k => !k.startsWith('__'));
    const listName = names.find(k => db.root[k] && typeof db.root[k].length === 'number');
    const row = listName ? db.root[listName][0] : null;
    return { listName, count: listName ? Number(db.root[listName].length || 0) : 0, sampleKeys: row ? Object.keys(row) : [] };
  } finally { await db.close?.(); }
}
async function availableShards({ $i }) {
  const root = ragRoot($i), files = fs.existsSync(root) ? fs.readdirSync(root) : [];
  const awts = files.filter(f => f.endsWith('.awtsdb') && !f.includes('smoke')).map(f => path.join(root, f));
  const out = [];
  for (const file of awts) {
    try {
      const id = slug(file), manifest = existingJson(file.replace(/\.awtsdb$/, '.fast-manifest.json')) || existingJson(file.replace(/\.awtsdb$/, '.BENTO.summary.json'));
      const info = await inspectShard(file); if (!info.listName) continue;
      const st = stat(file);
      out.push({ id, aliases: aliases(id), title: manifest?.title || label(id), file, listName: info.listName, count: info.count, bytes: st?.size || 0, sampleKeys: info.sampleKeys });
    } catch (e) { out.push({ id: slug(file), file, error: e.message }); }
  }
  return out.sort((a, b) => (b.count || 0) - (a.count || 0));
}
async function resolveShard({ $i, lane }) {
  const all = await availableShards({ $i });
  const id = String(lane || '').toLowerCase();
  return all.find(s => s.id === id || s.aliases?.includes(id) || s.id.includes(id)) || all[0] || null;
}
module.exports = { rowsOf, availableShards, resolveShard };
