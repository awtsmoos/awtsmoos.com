const fs = require('fs');
const path = require('path');
const { createLocalApiServer } = require('../../apps/tunnel/agent/lib/local-api.js');
const host = '127.0.0.1', port = 49880;
const root = path.resolve(__dirname, 'push-live-hls-results');
fs.rmSync(root, { recursive:true, force:true }); fs.mkdirSync(root, { recursive:true });
const api = createLocalApiServer({ configLoader: () => ({ tunnelName:'isolated-hls-upload', root, localApi:{ enabled:true, host, port } }) });
const listen = () => new Promise((res, rej) => { api.once('error', rej); api.listen(port, host, res); });
async function j(p, init={}) { const r = await fetch(`http://${host}:${port}${p}`, init); const t = await r.text(); let json; try{json=JSON.parse(t)}catch{json={raw:t}}; return {status:r.status,json}; }
(async()=>{ try {
  await listen();
  const start = await j('/streaming/start', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({label:'youtube-hls-ts-proof', targetDuration:1, format:'hls-mpegts'})});
  const sid = start.json.session.id;
  const dir = path.resolve(__dirname, 'mb-hls-live3-probe-out');
  const pushes = [];
  for (const name of ['segment-1-1.ts','segment-1-2.ts','segment-1-3.ts']) {
    const bytes = fs.readFileSync(path.join(dir, name));
    pushes.push(await j(`/streaming/hls-segment/${sid}/${name}`, {method:'POST', headers:{'content-type':'video/mp2t','x-awtsmoos-duration':'1','x-awtsmoos-index':String(pushes.length)}, body:bytes}));
  }
  const open = await j('/streaming', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({action:'streamingHlsPlaylist', sessionId:sid})});
  const stop = await j('/streaming/stop', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({sessionId:sid})});
  const closed = await j('/streaming', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({action:'streamingHlsPlaylist', sessionId:sid, endList:true})});
  const out = {sessionId:sid,start,pushes,open,stop,closed};
  fs.writeFileSync(path.join(root,'result.json'), JSON.stringify(out,null,2));
  console.log(JSON.stringify({ok:true, sessionId:sid, pushBytes:pushes.map(x=>x.json.bytes), playlist:closed.json.playlist, counters:stop.json.session.counters}, null, 2));
} catch(e) { console.error(e.stack || e.message); process.exitCode=1; } finally { api.close(); } })();
