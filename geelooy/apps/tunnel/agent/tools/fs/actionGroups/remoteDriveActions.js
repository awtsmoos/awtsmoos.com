// B"H
const fsp = require('fs/promises');
const path = require('path');
const { safePath, rel, assertNotSecret } = require('../pathGuard.js');
const { listDirDetailed } = require('../listing.js');
const { treeText } = require('../tree.js');
const { readText } = require('../readWrite.js');
function mount(config, payload = {}) { const p = payload.mountPath || payload.path || payload.p || '.'; const full = safePath(config, p); return { id:'local-root', title:payload.title || 'Connected Tunnel Root', root:config.root, mountPath:rel(config, full), permissions:['read','list','tree','stat'], commandEnabled:false }; }
function resolve(config, payload = {}) { return safePath(config, payload.path || payload.p || '.'); }
function buildRemoteDriveActions(ctx) { const { config, payload = {} } = ctx; return {
  async remoteDriveList() { return { ok:true, action:'remoteDriveList', drives:[mount(config, payload)], warning:'Remote drive is owner-scoped and read-only by default.' }; },
  async remoteDriveMount() { return { ok:true, action:'remoteDriveMount', drive:mount(config, payload) }; },
  async remoteDriveUnmount() { return { ok:true, action:'remoteDriveUnmount', driveId:payload.driveId || 'local-root', removed:true }; },
  async remoteDriveTree() { return { ok:true, action:'remoteDriveTree', drive:mount(config, payload), treeText:await treeText(config, payload.path || payload.p || '.', payload.depth, payload.limit) }; },
  async remoteDriveRead() { const full = resolve(config, payload); assertNotSecret(config, full); return { ok:true, action:'remoteDriveRead', path:rel(config, full), ...(await readText(config, rel(config, full), payload.maxChars || 12000, payload.offsetChars || 0)) }; },
  async remoteDriveStat() { const full = resolve(config, payload), s = await fsp.stat(full); return { ok:true, action:'remoteDriveStat', path:rel(config, full), isDirectory:s.isDirectory(), size:s.size, mtime:s.mtime.toISOString() }; },
  async remoteDriveSearch() { const root = resolve(config, payload), ents = await fsp.readdir(root, { withFileTypes:true }).catch(() => []); return { ok:true, action:'remoteDriveSearch', path:rel(config, root), items:ents.filter(e => String(e.name).includes(payload.q || payload.query || '')).map(e => e.name + (e.isDirectory() ? '/' : '')) }; },
  async remoteDriveBrowse() { const p = payload.path || payload.p || '.'; return { ok:true, action:'remoteDriveBrowse', path:p, detailedItems:await listDirDetailed(config, p) }; }
};}
/**
 * B"H
 * The user's machine appears as a drive, but the guard stands at the root:
 * read-only, path-checked, secret-aware, and not a command hole.
 */
module.exports = { buildRemoteDriveActions };
