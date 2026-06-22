// B"H
const fs = require('fs');
const path = require('path');
const { createLocalApiServer } = require('../../apps/tunnel/agent/lib/local-api.js');
const port = 49877;
const host = '127.0.0.1';
const outDir = path.resolve(__dirname, 'results');
fs.rmSync(outDir, { recursive:true, force:true });
fs.mkdirSync(outDir, { recursive:true });
const server = createLocalApiServer({
  configLoader: () => ({ tunnelName:'isolated-nesher-test', root:outDir, localApi:{ enabled:true, host, port } })
});
function listen() { return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); }); }
async function j(pathname, init = {}) {
  const res = await fetch(`http://${host}:${port}${pathname}`, init);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw:text }; }
  return { status:res.status, json };
}
async function main() {
  await listen();
  const health = await j('/health');
  const index = await j('/streaming');
  const start = await j('/streaming/start', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ label:'isolated-hls', targetDuration:2 }) });
  const sessionId = start.json.session?.id || start.json.id || start.json.sessionId;
  if (!sessionId) throw new Error('no_session_id:' + JSON.stringify(start));
  const raw = Buffer.from([0x47,0x40,0x00,0x10,1,2,3,4,5,6,7,8,9,10,11,12]);
  const rawPush = await j(`/streaming/hls-segment/${encodeURIComponent(sessionId)}/raw-000001.ts`, { method:'POST', headers:{ 'content-type':'video/mp2t', 'x-awtsmoos-duration':'2', 'x-awtsmoos-index':'1' }, body:raw });
  const playlistOpen = await j('/streaming', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ action:'streamingHlsPlaylist', sessionId }) });
  const chunkPush = await j('/streaming/chunk', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ sessionId, name:'webcodecs-header.webm', contentType:'video/webm', chunk64:Buffer.from('webm-header').toString('base64') }) });
  const stop = await j('/streaming/stop', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ sessionId }) });
  const playlistClosed = await j('/streaming', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ action:'streamingHlsPlaylist', sessionId, endList:true }) });
  const result = { port, health, index, start, sessionId, rawPush, playlistOpen, chunkPush, stop, playlistClosed };
  fs.writeFileSync(path.join(outDir, 'result.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ ok:true, port, sessionId, healthStreaming:health.json.streaming, indexOk:index.json.ok, rawBytes:rawPush.json.bytes, playlistOpen:playlistOpen.json.playlist, chunkOk:chunkPush.json.ok, stopStatus:stop.json.session?.status, playlistClosed:playlistClosed.json.playlist }, null, 2));
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; }).finally(() => server.close());
