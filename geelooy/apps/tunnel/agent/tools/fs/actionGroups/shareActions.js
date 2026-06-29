// B"H
const Registry = require('../../../lib/share/registry.js');
const Audit = require('../../../lib/share/audit.js');
const Redact = require('../../../lib/share/redact.js');
function publicUrl(payload, session) { const base = String(payload.publicBaseUrl || 'https://awtsmoos.com').replace(/\/$/, ''); return `${base}/p/${encodeURIComponent(session.token)}`; }
function expose(session, payload) { return { ...Redact.publicSession(session), url: publicUrl(payload, session), token: session.token, warning:'Secret link is scoped, expiring, revocable, and read-only unless command permission was explicitly granted.' }; }
function kindPayload(payload, kind) { return { ...payload, kind, path: payload.path || payload.p || '.', permissions: payload.permissions || 'read,list,preview' }; }
function buildShareActions(ctx) { const { config, payload = {} } = ctx; return {
  async shareCreate() { const s = await Registry.create(config, payload); return { ok:true, action:'shareCreate', share:expose(s, payload) }; },
  async sharePreviewFile() { const s = await Registry.create(config, kindPayload(payload, 'file')); return { ok:true, action:'sharePreviewFile', share:expose(s, payload) }; },
  async sharePreviewServer() { const s = await Registry.create(config, { ...payload, kind:'server', permissions:payload.permissions || 'preview', path:payload.proxyPath || '/', url:payload.url || '', port:payload.port || null }); return { ok:true, action:'sharePreviewServer', share:expose(s, payload) }; },
  async sharePreviewCommandJob() { const s = await Registry.create(config, { ...payload, kind:'commandJob', permissions:payload.permissions || 'commandOutput,preview', jobId:payload.jobId || payload.id || '' }); return { ok:true, action:'sharePreviewCommandJob', share:expose(s, payload) }; },
  async shareList() { return { ok:true, action:'shareList', shares:await Registry.list(config) }; },
  async shareGet() { const s = await Registry.get(config, payload.shareId || payload.id || payload.token); return s ? { ok:true, action:'shareGet', share:Redact.publicSession(s) } : { ok:false, action:'shareGet', error:'share_not_found' }; },
  async shareRevoke() { const s = await Registry.revoke(config, payload.shareId || payload.id || payload.token); return s ? { ok:true, action:'shareRevoke', share:s } : { ok:false, action:'shareRevoke', error:'share_not_found' }; },
  async shareRevokeAll() { return { ok:true, action:'shareRevokeAll', shares:await Registry.revokeAll(config) }; },
  async shareAudit() { return { ok:true, action:'shareAudit', audit:await Audit.list(config, Number(payload.limit || 100)) }; }
};}
/**
 * B"H
 * A secret URL is not a kingdom; it is a candle in a glass box. These actions
 * create scoped preview doors with expiry, audit, and revocation before any
 * remote eye may look through the tunnel.
 */
module.exports = { buildShareActions };
