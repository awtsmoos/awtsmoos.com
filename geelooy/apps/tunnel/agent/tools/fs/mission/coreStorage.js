// B"H
const fsp = require('fs/promises');
const crypto = require('crypto');
const { safePath } = require('../pathGuard.js');

function createStorage(env) {
  async function ensure(config) {
    await fsp.mkdir(env.dir(config), { recursive: true });
  }
  async function save(config, m) {
    m.updatedAt = env.now();
    await fsp.mkdir(env.dir(config, m.id), { recursive: true });
    const target = env.file(config, m.id);
    const tmp = safePath(config, `${env.DIR}/${env.clean(m.id)}/mission.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`);
    await fsp.writeFile(tmp, JSON.stringify(m, null, 2), 'utf8');
    await fsp.rename(tmp, target);
    return m;
  }
  async function create(config, input = {}) {
    await ensure(config);
    const m = env.shape(input, input.id || env.id());
    env.event(m, 'created', 'Mission created', { goal: m.goal });
    return save(config, m);
  }
  async function load(config, mid) {
    for (let attempt = 0; attempt < 8; attempt++) {
      try { return JSON.parse(await fsp.readFile(env.file(config, mid), 'utf8')); }
      catch { if (attempt === 7) return null; await new Promise(r => setTimeout(r, 5 + attempt * 5)); }
    }
    return null;
  }
  async function all(config) {
    await ensure(config);
    const ents = await fsp.readdir(env.dir(config), { withFileTypes: true }).catch(() => []);
    const out = [];
    for (const e of ents) if (e.isDirectory()) { const m = await load(config, e.name); if (m) out.push(m); }
    return out.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }
  return { ensure, save, create, load, all };
}

/**
 * B"H
 * Storage is a quiet ark: write atomically, read patiently, list humbly.
 */
module.exports = { createStorage };
