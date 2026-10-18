// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const { readStore } = require('../core/store.js');
const Provenance = require('../core/tunnelSecurity/bindingProvenance.js');
const Response = require('./previewProxyResponse.js');

const ID_PATTERN = /^pl_[0-9a-f]{24}$/;
const NAME_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

/**
 * Public transport has no authority to mint preview access: one live,
 * possession-proven named device is selected from the binding store and the
 * installed agent validates the per-preview bearer itself on EVERY request.
 */
function ownerFor(tunnelName, store = readStore()) {
 if (!NAME_PATTERN.test(tunnelName)) return null;
 const matches = Object.values(store.tunnelBindings || {}).filter(binding =>
  binding.tunnelName === tunnelName && Provenance.isTrustedBinding(binding));
 return matches.length === 1 ? matches[0] : null;
}
function requestPath(context, params = {}) {
 const query = context.paramKinds?.GET || context.$_GET || {};
 if (!query.path64) {
  const tail=String(params.tail||'');
  const url=String(context.request?.url||'');
  const qs=url.includes('?')?'?'+url.split('?').slice(1).join('?'):'';
  // A route tail is never treated as authority: the installed agent
  // normalizes traversal and fixes the upstream to 127.0.0.1.
  return '/'+tail+qs;
 }
 const source = String(query.path64);
 if (source.length > 8192 || !/^[A-Za-z0-9+/_=-]+$/.test(source)) return null;
 try {
  const path = Buffer.from(source, 'base64').toString('utf8');
  return path.startsWith('/') && path.length <= 4096 ? path : null;
 } catch { return null; }
}
function previewHeaders(headers={}) {
 const reduced={};
 if (headers.authorization) reduced.authorization=headers.authorization;
 const cookie=String(headers.cookie||'');
 const tokenCookie=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith('awtsmoos_preview='));
 if(tokenCookie) reduced.cookie=tokenCookie;
 if(headers.range)reduced.range=headers.range;
 return reduced;
}
function error(code,status=404) {return {ok:false,status,error:code};}
async function previewLinkRelay(context, params={}) {
 const tunnelName=String(params.tunnelName||'');
 const tokenId=String(params.tokenId||'');
 if (!ID_PATTERN.test(tokenId)) return error('preview_link_not_found',404);
 const method=String(context.request?.method||'GET').toUpperCase();
 if (!['GET','HEAD'].includes(method)) return error('preview_link_method_not_allowed',405);
 const path=requestPath(context,params);
 if(!path)return error('invalid_preview_path',400);
 const owner=ownerFor(tunnelName);
 if(!owner)return error('preview_device_unavailable',404);
 if(!previewHeaders(context.request?.headers).authorization &&
    !previewHeaders(context.request?.headers).cookie) {
  return browserBootstrap(context, tunnelName, tokenId);
 }
 try {
  const result=await context.ws.sendTunnelRequest(owner.ownerAccountId,owner.tunnelName,{
   action:'previewLinkProxy',tokenId,path,method,
   headers:previewHeaders(context.request?.headers),responseBodyMode:'base64',timeoutMs:12000
  },15000);
  if(!result || result.ok!==true)return error(result?.error||'preview_link_unavailable',Number(result?.status||502));
  const response=context.response||context.res;
  if(response){
   response.statusCode=Number(result.status||200);
   for(const [name,value] of Object.entries(Response.safeResponseHeaders(result.headers))){
    if(['content-security-policy','access-control-allow-origin','content-length'].includes(String(name).toLowerCase()))continue;
    try{response.setHeader(name,value)}catch{}
   }
   // Arbitrary localhost HTML must NEVER gain awtsmoos.com origin authority.
   response.setHeader?.('Content-Security-Policy','sandbox allow-scripts allow-forms');
   response.setHeader?.('Cache-Control','private, no-store');
   response.setHeader?.('X-Content-Type-Options','nosniff');
  }
  return Response.responseBody(result);
 }catch{return error('preview_relay_unavailable',502);}
}
function browserBootstrap(context,tunnelName,tokenId){
 const response=context.response||context.res;
 response?.setHeader?.('Cache-Control','no-store');
 response?.setHeader?.('Content-Type','text/html; charset=utf-8');
 response?.setHeader?.('Content-Security-Policy',"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'");
 response?.setHeader?.('Referrer-Policy','no-referrer');
 // Fixed script; tunnel/token are validated before this function is reached.
 const path='/api/tunnel/control/preview-link/'+encodeURIComponent(tunnelName)+'/'+tokenId+'/';
 return `<!doctype html><meta charset="utf-8"><title>Private Awtsmoos preview</title><body style="font:16px system-ui;padding:2rem"><h1>B&quot;H — Private preview</h1><p id="state">A temporary preview capability is required.</p><script>(function(){const m=/^#awtsmoos_preview=([0-9a-f]{64})$/.exec(location.hash);if(!m)return;document.cookie='awtsmoos_preview='+m[1]+'; Path=${path}; Secure; SameSite=Strict; Max-Age=1800';history.replaceState(null,'',location.pathname+location.search);location.reload()})();</script></body>`;
}
module.exports={previewLinkRelay,ownerFor,requestPath,previewHeaders,browserBootstrap};
