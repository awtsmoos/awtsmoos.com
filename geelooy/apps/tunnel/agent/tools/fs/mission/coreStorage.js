// B"H
const fsp = require('fs/promises');
const crypto = require('crypto');
const { safePath } = require('../pathGuard.js');
const AwdbStore = require('./awdbStore.js');
function createStorage(env) {
  async function ensure(config) { await fsp.mkdir(env.dir(config), { recursive: true }); }
  async function save(config, m) {
    m.updatedAt = env.now(); await ensure(config); AwdbStore.save(config, m);
    if (process.env.AWTSMOOS_MISSION_JSON_BACKUP === '1') await saveJson(config, m);
    return m;
  }
  async function saveJson(config, m) {
    await fsp.mkdir(env.dir(config, m.id), { recursive: true });
    const tmp = safePath(config, `${env.DIR}/${env.clean(m.id)}/mission.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`);
    await fsp.writeFile(tmp, JSON.stringify(m, null, 2), 'utf8');
    await fsp.rename(tmp, env.file(config, m.id));
  }
  async function create(config, input = {}) {
    await ensure(config); const m = env.shape(input, input.id || env.id());
    env.event(m, 'created', 'Mission created', { goal: m.goal }); return save(config, m);
  }
  async function load(config, mid) { return AwdbStore.load(config, mid) || await loadJson(config, mid); }
  async function loadJson(config, mid) {
    for (let attempt = 0; attempt < 8; attempt++) try { return JSON.parse(await fsp.readFile(env.file(config, mid), 'utf8')); }
    catch { if (attempt === 7) return null; await new Promise(r => setTimeout(r, 5 + attempt * 5)); }
  }
  async function all(config) {
    await ensure(config); const got = AwdbStore.all(config); if (got.length) return sort(got);
    const ents = await fsp.readdir(env.dir(config), { withFileTypes: true }).catch(() => []), out = [];
    for (const e of ents) if (e.isDirectory()) { const m = await loadJson(config, e.name); if (m) out.push(m); }
    return sort(out);
  }
  function sort(items) { return items.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))); }
  return { ensure, save, create, load, all };
}
module.exports = { createStorage };
