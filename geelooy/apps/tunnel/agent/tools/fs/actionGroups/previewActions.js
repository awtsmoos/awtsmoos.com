// B"H
const Url = require('../preview/url.js');
const Payload = require('../preview/payload.js');
const Detect = require('../preview/detect.js');
const Guidance = require('../preview/guidance.js');
const Policy = require('../preview/policy.js');
function createPayload(payload, kind, extra = {}) { return Payload.createPayload(payload, kind, extra); }
function previewUrl(payload, preview) { return Url.previewUrl(payload, preview); }
function simple(action, payload, kind, extra = {}) {
  const preview = createPayload(payload, kind, extra);
  return { ok:true, action, preview, url:previewUrl(payload, preview) };
}
async function localServer(payload) {
  const detected = await Detect.detect(payload), chosen = choose(payload, detected);
  const url = payload.url || chosen?.url || (payload.port ? `http://127.0.0.1:${payload.port}${payload.proxyPath || '/'}` : '');
  const preview = Policy.apply(createPayload(payload, 'proxy', { url, port:chosen?.port || payload.port || null, path:payload.proxyPath || '/', detectedServers:detected }), payload);
  return { ok:!!url && Policy.localServerAllowed(payload), action:'previewExposeLocalServer', preview, detectedServers:detected,
    selectedServer:chosen || (url ? { url, port:payload.port || null, manual:true } : null), url:url ? previewUrl(payload, preview) : '',
    proxyUrl:url ? Url.proxyUrl(payload, url) : '', agentGuidance:{ purpose:'preview-local-server', plainEnglish:Guidance.text(chosen || (url ? { url, port:payload.port, title:'' } : null), detected), canSteer:true },
    nextSuggestedAction:Guidance.payload(chosen || (url ? { url, port:payload.port } : null)) };
}
function choose(payload, detected) { if (payload.port) return detected.find(s => Number(s.port) === Number(payload.port)) || null; return detected[0] || null; }
function buildPreviewActions(ctx) { const { payload } = ctx; return {
  async previewSettingsGet(){return {ok:true,action:'previewSettingsGet',url:`${Url.baseUrl(payload)}/preview/settings`,defaults:{ aiLocalServerPreview:true, privateLocalServerPreview:true }};},
  async previewSettingsSet(){return {ok:true,action:'previewSettingsSet',url:`${Url.baseUrl(payload)}/preview/settings/set`,settings:{ aiLocalServerPreview:true, privateLocalServerPreview:true, ...(payload.settings||payload.content||{}) }};},
  async previewList(){return {ok:true,action:'previewList',url:`${Url.baseUrl(payload)}/preview/list`};},
  async previewRevoke(){return {ok:true,action:'previewRevoke',url:`${Url.baseUrl(payload)}/preview/revoke?previewId=${encodeURIComponent(payload.previewId||payload.id||'')}`};},
  async previewCreate(){return simple('previewCreate',payload,payload.kind||'file');}, async previewFile(){return simple('previewFile',payload,'file');}, async previewFolder(){return simple('previewFolder',payload,'folder');},
  async previewPage(){return simple('previewPage',payload,'page',{html:payload.html||payload.content||'',css:payload.css||'',data:payload.data||null});}, async previewCollection(){return simple('previewCollection',payload,'collection',{items:payload.items||payload.files||[]});},
  async previewLiveCommand(){return simple('previewLiveCommand',payload,'live',{commandId:payload.commandId||payload.actionId||''});}, async previewActionResult(){return simple('previewActionResult',payload,'action',{actionId:payload.actionId||payload.id||''});},
  async previewExposeLocalServer(){return localServer(payload);}
};}
/** B"H — Private local dev previews now declare default-on policy. */
module.exports = { buildPreviewActions, createPayload, previewUrl, localServer };
