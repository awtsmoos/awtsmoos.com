// B"H
function safe(path, fallback) { try { return require(path); } catch (error) { return { ...fallback, unavailable:true, loadError:error.code || error.message }; } }
const Url = safe('./url.js', { baseUrl:()=>'https://awtsmoos.com/api/tunnel/control', previewUrl:()=>'', proxyUrl:()=>'' });
const Payload = safe('./payload.js', { createPayload:(payload, kind, extra)=>({ kind, ...extra }) });
const Detect = safe('./detect.js', { detect:async()=>[] });
const Guidance = safe('./guidance.js', { text:()=> 'Local server preview helpers are partly unavailable, but the tunnel stayed alive.', payload:()=>null });
const Policy = safe('./policy.js', { apply:x=>x, localServerAllowed:()=>true });
/** B"H — Preview dependencies degrade instead of killing the native tunnel. */
module.exports = { Url, Payload, Detect, Guidance, Policy };
