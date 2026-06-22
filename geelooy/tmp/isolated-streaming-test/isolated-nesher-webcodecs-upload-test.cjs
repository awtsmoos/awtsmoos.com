// B"H
const fs = require('fs');
const http = require('http');
const path = require('path');
const CDP = require('/Users/awtsmoos/node_modules/chrome-remote-interface');
const { spawn } = require('child_process');
const { createLocalApiServer } = require('../../apps/tunnel/agent/lib/local-api.js');
const host = '127.0.0.1';
const apiPort = 49878;
const chromePort = 9344;
const root = path.resolve(__dirname, 'webcodecs-upload-results');
fs.rmSync(root, { recursive:true, force:true });
fs.mkdirSync(root, { recursive:true });
const api = createLocalApiServer({ configLoader:() => ({ tunnelName:'isolated-webcodecs-upload', root, localApi:{ enabled:true, host, port:apiPort } }) });
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profile = '/tmp/isolated-webcodecs-upload-profile';
fs.rmSync(profile, { recursive:true, force:true });
function listen(server, port) { return new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); }); }
function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
async function waitCdp() {
  for (let i = 0; i < 80; i++) {
    try { await new Promise((resolve, reject) => http.get(`http://${host}:${chromePort}/json/version`, r => { r.resume(); resolve(); }).on('error', reject)); return; }
    catch { await wait(250); }
  }
  throw new Error('cdp_timeout');
}
async function j(pathname, init = {}) {
  const res = await fetch(`http://${host}:${apiPort}${pathname}`, init);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw:text }; }
  return { status:res.status, json };
}
async function main() {
  await listen(api, apiPort);
  const chrome = spawn(chromePath, ['--headless=new', `--remote-debugging-port=${chromePort}`, `--user-data-dir=${profile}`, '--enable-features=WebCodecs', '--disable-gpu', 'http://127.0.0.1:5177/apps/nesher-studio/'], { stdio:'ignore' });
  try {
    await waitCdp();
    const client = await CDP({ port:chromePort });
    const { Runtime, Page } = client;
    await Page.enable(); await Runtime.enable(); await Page.loadEventFired().catch(() => {}); await wait(1000);
    const expression = `new Promise(async (resolve, reject) => {
      try {
        const { startWebCodecsWebmStream } = await import('/apps/nesher-studio/modules/webcodecs/webmStreamer.js');
        const canvas = document.createElement('canvas'); canvas.width = 640; canvas.height = 360; document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d'); let drawn = 0;
        const stream = await startWebCodecsWebmStream({
          canvas,
          fps:30,
          bitrate:1400000,
          tunnelBase:'http://127.0.0.1:${apiPort}',
          onStatus:()=>{},
          drawFrame:() => {
            ctx.fillStyle = 'rgb(' + (drawn % 255) + ',25,100)'; ctx.fillRect(0,0,640,360);
            ctx.fillStyle = 'white'; ctx.font = '32px sans-serif'; ctx.fillText('Isolated upload ' + drawn, 40, 90);
            ctx.fillStyle = 'lime'; ctx.fillRect((drawn * 11) % 640, 190, 80, 70); drawn++;
          }
        });
        await new Promise(r => setTimeout(r, 4200));
        const stopped = await stream.stop();
        resolve(stopped);
      } catch (e) { reject(e.message || String(e)); }
    })`;
    const evalResult = await Runtime.evaluate({ expression, awaitPromise:true, returnByValue:true, timeout:30000 });
    if (evalResult.exceptionDetails) throw new Error(JSON.stringify(evalResult.exceptionDetails));
    const browser = evalResult.result.value;
    const list = await j('/streaming', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ action:'streamingSessionList' }) });
    const status = browser.sessionId ? await j('/streaming/status', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ sessionId:browser.sessionId }) }) : null;
    const result = { apiPort, browser, list, status };
    fs.writeFileSync(path.join(root, 'webcodecs-upload-result.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ ok:true, apiPort, browser, listOk:list.json.ok, statusOk:status?.json?.ok, counters:status?.json?.session?.counters }, null, 2));
    await client.close(); chrome.kill('SIGTERM');
  } catch (e) { chrome.kill('SIGTERM'); throw e; }
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; }).finally(() => api.close());
