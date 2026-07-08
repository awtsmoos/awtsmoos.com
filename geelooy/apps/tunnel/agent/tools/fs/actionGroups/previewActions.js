// B"H
const D = require('../preview/deps.js');
function createPayload(payload, kind, extra = {}) { return D.Payload.createPayload(payload, kind, extra); }
function previewUrl(payload, preview) { return D.Url.previewUrl(payload, preview); }
function simple(action, payload, kind, extra = {}) {
  const preview = createPayload(payload, kind, extra), url = previewUrl(payload, preview);
  return exposed(action, { ok:true, action, preview, url, viewUrl:url });
}
async function localServer(payload) {
  const explicit = explicitServer(payload);
  const detected = explicit ? [] : await D.Detect.detect(payload);
  const chosen = explicit || choose(payload, detected);
  const localUrl = payload.url || chosen?.url || (payload.port ? `http://127.0.0.1:${payload.port}${payload.proxyPath || '/'}` : '');
  const preview = D.Policy.apply(createPayload(payload, 'proxy', { url:localUrl, port:chosen?.port || payload.port || null, path:payload.proxyPath || '/', detectedServers:detected }), payload);
  const publicCreateUrl = localUrl ? previewUrl(payload, preview) : '';
  const publicProxyUrl = localUrl ? D.Url.proxyUrl(payload, localUrl) : '';
  return exposed('previewExposeLocalServer', {
    ok:!!localUrl && D.Policy.localServerAllowed(payload), action:'previewExposeLocalServer', preview, detectedServers:detected,
    selectedServer:chosen || (localUrl ? { url:localUrl, port:payload.port || null, manual:true } : null), url:publicCreateUrl, viewUrl:publicCreateUrl,
    proxyUrl:publicProxyUrl, rawUrl:publicProxyUrl, agentGuidance:{ purpose:'preview-local-server', plainEnglish:D.Guidance.text(chosen || (localUrl ? { url:localUrl, port:payload.port, title:'' } : null), detected), canSteer:true },
    nextSuggestedAction:D.Guidance.payload(chosen || (localUrl ? { url:localUrl, port:payload.port } : null))
  });
}
function exposed(action, out = {}) {
  const url = out.url || out.viewUrl || '';
  const proxyUrl = out.proxyUrl || out.rawUrl || '';
  const text = action === 'previewExposeLocalServer' ? `Awtsmoos local-server preview URL: ${proxyUrl || url}` : `Awtsmoos preview URL: ${url}`;
  return { ...out, action, summary:text, next:text, content:text, result:{ url, viewUrl:out.viewUrl || url, proxyUrl, rawUrl:out.rawUrl || proxyUrl, preview:out.preview || null } };
}
function explicitServer(payload = {}) {
  if (payload.url) return { url:payload.url, port:payload.port || Number((String(payload.url).match(/:(\d+)/)||[])[1]) || null, manual:true };
  if (payload.port) return { url:`http://127.0.0.1:${payload.port}${payload.proxyPath || '/'}`, port:payload.port, manual:true };
  return null;
}
function choose(payload, detected) { if (payload.port) return detected.find(s => Number(s.port) === Number(payload.port)) || null; return detected[0] || null; }
function buildPreviewActions(ctx) { const { payload } = ctx; return {
  async previewSettingsGet(){return {ok:true,action:'previewSettingsGet',url:`${D.Url.baseUrl(payload)}/preview/settings`,defaults:{ aiLocalServerPreview:true, privateLocalServerPreview:true }};},
  async previewSettingsSet(){return {ok:true,action:'previewSettingsSet',url:`${D.Url.baseUrl(payload)}/preview/settings/set`,settings:{ aiLocalServerPreview:true, privateLocalServerPreview:true, ...(payload.settings||payload.content||{}) }};},
  async previewList(){return {ok:true,action:'previewList',url:`${D.Url.baseUrl(payload)}/preview/list`};}, async previewRevoke(){return {ok:true,action:'previewRevoke',url:`${D.Url.baseUrl(payload)}/preview/revoke?previewId=${encodeURIComponent(payload.previewId||payload.id||'')}`};},
  async previewCreate(){return simple('previewCreate',payload,payload.kind||'file');}, async previewFile(){return simple('previewFile',payload,'file');}, async previewFolder(){return simple('previewFolder',payload,'folder');},
  async previewPage(){return simple('previewPage',payload,'page',{html:payload.html||payload.content||'',css:payload.css||'',data:payload.data||null});}, async previewCollection(){return simple('previewCollection',payload,'collection',{items:payload.items||payload.files||[]});},
  async previewLiveCommand(){return simple('previewLiveCommand',payload,'live',{commandId:payload.commandId||payload.actionId||''});}, async previewActionResult(){return simple('previewActionResult',payload,'action',{actionId:payload.actionId||payload.id||''});}, async previewExposeLocalServer(){return localServer(payload);}
};}
/** B"H — Local servers become public Awtsmoos preview/proxy URLs without hiding the URL in compact envelopes. */
module.exports = { buildPreviewActions, createPayload, previewUrl, localServer, explicitServer, exposed };
