// B"H
const Registry = require('../../../lib/share/registry.js');
const Audit = require('../../../lib/share/audit.js');
const Redact = require('../../../lib/share/redact.js');
const Preview = require('./previewActions.js');
function publicUrl(payload, session) { const base = String(payload.publicBaseUrl || 'https://awtsmoos.com').replace(/\/$/, ''); return `${base}/p/${encodeURIComponent(session.token)}`; }
function expose(session, payload) { return { ...Redact.publicSession(session), url:publicUrl(payload, session), token:session.token, warning:'Secret link is scoped, expiring, revocable, and read-only unless command permission was explicitly granted.' }; }
function kindPayload(payload, kind) { return { ...payload, kind, path:payload.path || payload.p || '.', permissions:payload.permissions || 'read,list,preview' }; }
function hosted(payload, kind, extra = {}) { const preview = Preview.createPayload(payload, kind, { ...extra, title:payload.title || extra.title || `Shared ${kind}` }); return { preview, previewCreateUrl:Preview.previewUrl(payload, preview), gateway:'hosted-preview-gateway', guidance:'Open previewCreateUrl while authenticated, or call previewCreate/previewFile/previewExposeLocalServer directly to receive /view/<id>.' }; }
function buildShareActions(ctx) { const { config, payload = {} } = ctx; return {
  async shareCreate() { const s = await Registry.create(config, payload); return { ok:true, action:'shareCreate', share:expose(s, payload), hostedPreview:hosted(payload, payload.kind || 'file') }; },
  async sharePreviewFile() { const s = await Registry.create(config, kindPayload(payload, 'file')); return { ok:true, action:'sharePreviewFile', share:expose(s, payload), hostedPreview:hosted(payload, 'file') }; },
  async sharePreviewFolder() { const s = await Registry.create(config, kindPayload(payload, 'folder')); return { ok:true, action:'sharePreviewFolder', share:expose(s, payload), hostedPreview:hosted(payload, 'folder') }; },
  async sharePreviewServer() { const url = payload.url || (payload.port ? `http://127.0.0.1:${payload.port}${payload.proxyPath || '/'}` : ''); const s = await Registry.create(config, { ...payload, kind:'server', permissions:payload.permissions || 'preview', path:payload.proxyPath || '/', url, port:payload.port || null }); return { ok:true, action:'sharePreviewServer', share:expose(s, payload), hostedPreview:hosted(payload, 'proxy', { url, port:payload.port || null, path:payload.proxyPath || '/' }) }; },
  async sharePreviewCommandJob() { const s = await Registry.create(config, { ...payload, kind:'commandJob', permissions:payload.permissions || 'commandOutput,preview', jobId:payload.jobId || payload.id || '' }); return { ok:true, action:'sharePreviewCommandJob', share:expose(s, payload), hostedPreview:hosted(payload, 'action', { actionId:payload.jobId || payload.id || '' }) }; },
  async shareList() { return { ok:true, action:'shareList', shares:await Registry.list(config) }; },
  async shareGet() { const s = await Registry.get(config, payload.shareId || payload.id || payload.token); return s ? { ok:true, action:'shareGet', share:Redact.publicSession(s) } : { ok:false, action:'shareGet', error:'share_not_found' }; },
  async shareRevoke() { const s = await Registry.revoke(config, payload.shareId || payload.id || payload.token); return s ? { ok:true, action:'shareRevoke', share:s } : { ok:false, action:'shareRevoke', error:'share_not_found' }; },
  async shareRevokeAll() { return { ok:true, action:'shareRevokeAll', shares:await Registry.revokeAll(config) }; },
  async shareAudit() { return { ok:true, action:'shareAudit', audit:await Audit.list(config, Number(payload.limit || 100)) }; }
};}
/**
 * B"H
 * Share now carries two keys: a local scoped token and the hosted /view gateway
 * recipe. The local candle and the public palace no longer drift apart.
 */
module.exports = { buildShareActions };
