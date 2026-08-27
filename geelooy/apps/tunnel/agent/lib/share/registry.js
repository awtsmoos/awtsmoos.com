// B"H
const fsp = require('fs/promises');
const path = require('path');
const Cap = require('./capability.js');
const Policy = require('./policy.js');
const Audit = require('./audit.js');
const Redact = require('./redact.js');
async function dir(config) { const d = path.join(config.root || process.cwd(), '.awtsmoos', 'shares'); await fsp.mkdir(d, { recursive:true }); return d; }
async function file(config) { return path.join(await dir(config), 'registry.json'); }
async function read(config) { return JSON.parse(await fsp.readFile(await file(config), 'utf8').catch(() => '{}')); }
async function write(config, data) { await fsp.writeFile(await file(config), JSON.stringify(data, null, 2), 'utf8'); }
async function create(config, input = {}) {
  const policy = Policy.createPolicy(input), sessionId = Cap.id('share'), tok = Cap.token(config, sessionId);
  if (Redact.isSecretPath(policy.scope.path) && !input.allowSecrets) throw new Error('refusing_secret_like_share_path');
  const now = Date.now(), session = { id:sessionId, token:tok, createdAt:new Date(now).toISOString(), expiresAt:new Date(now + policy.ttlMs).toISOString(), revokedAt:null, ...policy };
  const data = await read(config); data[sessionId] = session; await write(config, data); await Audit.record(config, { type:'share_created', sessionId, scope:session.scope, permissions:session.permissions }); return session;
}
async function list(config) { const data = await read(config); return Object.values(data).map(Redact.publicSession); }
async function get(config, idOrToken) { const data = await read(config), parsed = Cap.verify(config, idOrToken); return data[parsed?.sessionId || idOrToken] || null; }
async function revoke(config, idOrToken) { const data = await read(config), s = await get(config, idOrToken); if (!s) return null; s.revokedAt = new Date().toISOString(); data[s.id] = s; await write(config, data); await Audit.record(config, { type:'share_revoked', sessionId:s.id }); return Redact.publicSession(s); }
async function revokeAll(config) { const data = await read(config); for (const s of Object.values(data)) if (!s.revokedAt) s.revokedAt = new Date().toISOString(); await write(config, data); await Audit.record(config, { type:'share_revoke_all' }); return Object.values(data).map(Redact.publicSession); }
module.exports = { create, list, get, revoke, revokeAll };
