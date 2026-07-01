// B"H
const fsp = require('fs/promises');
const Paths = require('./paths.js');
const Meta = require('./meta.js');
const P = require('./policy.js');
async function dirBytes(dir) { let total = 0; for (const e of await fsp.readdir(dir, { withFileTypes:true }).catch(() => [])) { const p = `${dir}/${e.name}`; total += e.isDirectory() ? await dirBytes(p) : await Paths.sizeOf(p); } return total; }
async function entries(config) {
  const root = Paths.storeRoot(config), rows = [];
  for (const e of await fsp.readdir(root, { withFileTypes:true }).catch(() => [])) if (e.isDirectory()) rows.push({ name:e.name, path:Paths.jobDir(config, e.name), meta:await Meta.read(config, e.name) });
  return rows.sort((a,b) => Date.parse(a.meta?.finishedAt || a.meta?.startedAt || 0) - Date.parse(b.meta?.finishedAt || b.meta?.startedAt || 0));
}
async function collect(config) {
  await Paths.ensureDir(config); const now = Date.now(), root = Paths.storeRoot(config);
  for (const e of await entries(config)) if (now - Date.parse(e.meta?.finishedAt || e.meta?.startedAt || 0) > P.TTL_MS) await fsp.rm(e.path, { recursive:true, force:true }).catch(() => {});
  for (const e of await entries(config)) { if (await dirBytes(root) <= P.STORE_MAX_BYTES) break; await fsp.rm(e.path, { recursive:true, force:true }).catch(() => {}); }
}
module.exports = { collect, dirBytes, entries };
