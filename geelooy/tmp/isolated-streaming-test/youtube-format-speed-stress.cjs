// B"H
const fs = require('fs');
const http = require('http');
const path = require('path');
const CDP = require('/Users/awtsmoos/node_modules/chrome-remote-interface');
const { spawn } = require('child_process');
const { createLocalApiServer } = require('../../apps/tunnel/agent/lib/local-api.js');
const host = '127.0.0.1';
const apiPort = 49879;
const chromePort = 9345;
const root = path.resolve(__dirname, 'youtube-format-speed-results');
fs.rmSync(root, { recursive:true, force:true });
fs.mkdirSync(root, { recursive:true });
const api = createLocalApiServer({ configLoader:() => ({ tunnelName:'yt-format-stress', root, localApi:{ enabled:true, host, port:apiPort } }) });
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
  let json; try { json = JSON.parse(text); } catch { json = { raw:text }; }
  return { status:res.status, json };
}
async function main() {
  await listen(api, apiPort);
  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new', `--remote-debugging-port=${chromePort}`, `--user-data-dir=/tmp/yt-format-stress-profile`, '--enable-features=WebCodecs', '--disable-gpu', 'http://127.0.0.1:5177/apps/nesher-studio/'
  ], { stdio:'ignore' });
  try {
    await waitCdp();
    const client = await CDP({ port:chromePort });
    const { Runtime, Page } = client;
    await Page.enable(); await Runtime.enable(); await Page.loadEventFired().catch(() => {}); await wait(1000);
    const expression = `new Promise(async (resolve, reject) => {
      try {
        const supportConfigs = [
          { name:'vp9', config:{ codec:'vp09.00.10.08', width:1280, height:720, bitrate:4000000, framerate:30 } },
          { name:'h264_baseline', config:{ codec:'avc1.42001f', width:1280, height:720, bitrate:4000000, framerate:30 } },
          { name:'h264_main', config:{ codec:'avc1.4d401f', width:1280, height:720, bitrate:4000000, framerate:30 } },
          { name:'h264_high', config:{ codec:'avc1.64001f', width:1280, height:720, bitrate:4000000, framerate:30 } },
          { name:'hevc', config:{ codec:'hev1.1.6.L93.B0', width:1280, height:720, bitrate:4000000, framerate:30 } },
          { name:'av1', config:{ codec:'av01.0.08M.08', width:1280, height:720, bitrate:4000000, framerate:30 } }
        ];
        const support = [];
        for (const item of supportConfigs) {
          try { const result = await VideoEncoder.isConfigSupported(item.config); support.push({ name:item.name, supported:result.supported, config:result.config }); }
          catch (e) { support.push({ name:item.name, supported:false, error:e.message }); }
        }
        const { Muxer, ArrayBufferTarget, StreamTarget } = await import('https://esm.sh/webm-muxer@5.1.2?bundle');
        async function recordStress({ width, height, fps, seconds, bitrate }) {
          const target = new ArrayBufferTarget();
          const muxer = new Muxer({ target, video:{ codec:'V_VP9', width, height, frameRate:fps }, firstTimestampBehavior:'offset' });
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
          const enc = new VideoEncoder({ output:(chunk, meta)=>muxer.addVideoChunk(chunk, meta), error:e=>{ throw e; } });
          const cfg = (await VideoEncoder.isConfigSupported({ codec:'vp09.00.10.08', width, height, bitrate, framerate:fps })).config;
          enc.configure(cfg);
          const frames = Math.round(fps * seconds); const t0 = performance.now();
          for (let i=0; i<frames; i++) {
            ctx.fillStyle = 'rgb(' + (i % 255) + ',35,110)'; ctx.fillRect(0,0,width,height);
            ctx.fillStyle='white'; ctx.font=Math.max(22, Math.round(width/32)) + 'px sans-serif'; ctx.fillText(width+'x'+height+' frame '+i, 40, 80);
            ctx.fillStyle='lime'; ctx.fillRect((i*13)%width, Math.round(height*0.55), Math.round(width*0.08), Math.round(height*0.12));
            const frame = new VideoFrame(canvas, { timestamp: Math.round(i*1000000/fps), duration: Math.round(1000000/fps) });
            enc.encode(frame, { keyFrame:i % Math.max(1, fps*2) === 0 }); frame.close();
          }
          const queuedAt = performance.now(); await enc.flush(); const flushedAt = performance.now(); enc.close(); muxer.finalize();
          const bytes = new Uint8Array(target.buffer); let binary=''; for (let i=0;i<bytes.length;i++) binary += String.fromCharCode(bytes[i]);
          return { width, height, fps, seconds, frames, size:bytes.length, encodeLoopMs:queuedAt-t0, flushMs:flushedAt-queuedAt, totalMs:flushedAt-t0, realtimeFactor:seconds / ((flushedAt-t0)/1000), base64:btoa(binary) };
        }
        async function streamingStress({ width, height, fps, seconds, bitrate }) {
          const started = await fetch('http://127.0.0.1:${apiPort}/streaming/start', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ label:'yt-speed-webm-stream', format:'webm' }) }).then(r=>r.json());
          const sessionId = started.session.id;
          const pieces = []; const uploads = [];
          const target = new StreamTarget({ onHeader:d=>piece('header',d,0), onCluster:(d,_p,t)=>piece('cluster',d,t), onData:(_d,_p)=>{} });
          const muxer = new Muxer({ target, video:{ codec:'V_VP9', width, height, frameRate:fps }, streaming:true, firstTimestampBehavior:'offset' });
          const canvas = document.createElement('canvas'); canvas.width=width; canvas.height=height; const ctx=canvas.getContext('2d');
          const enc = new VideoEncoder({ output:(chunk, meta)=>muxer.addVideoChunk(chunk, meta), error:e=>{ throw e; } });
          const cfg = (await VideoEncoder.isConfigSupported({ codec:'vp09.00.10.08', width, height, bitrate, framerate:fps })).config; enc.configure(cfg);
          const frames = Math.round(fps * seconds); const t0 = performance.now();
          for (let i=0;i<frames;i++) {
            ctx.fillStyle='rgb('+(i%255)+',20,90)'; ctx.fillRect(0,0,width,height); ctx.fillStyle='white'; ctx.font='32px sans-serif'; ctx.fillText('stream '+i,40,80);
            const frame = new VideoFrame(canvas,{timestamp:Math.round(i*1000000/fps),duration:Math.round(1000000/fps)});
            enc.encode(frame,{keyFrame:i % Math.max(1,fps*2) === 0}); frame.close();
          }
          await enc.flush(); enc.close(); muxer.finalize(); await Promise.all(uploads);
          const t1 = performance.now();
          const status = await fetch('http://127.0.0.1:${apiPort}/streaming/status',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId})}).then(r=>r.json());
          await fetch('http://127.0.0.1:${apiPort}/streaming/stop',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId})});
          return { width,height,fps,seconds,frames,totalMs:t1-t0,realtimeFactor:seconds/((t1-t0)/1000), sessionId,pieces,counters:status.session.counters };
          function piece(kind, data, timestamp) {
            const bytes = new Uint8Array(data); pieces.push({kind,timestamp,bytes:bytes.length});
            let binary=''; for (let i=0;i<bytes.length;i++) binary += String.fromCharCode(bytes[i]);
            uploads.push(fetch('http://127.0.0.1:${apiPort}/streaming/chunk',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId,name:'piece-'+pieces.length+'.webm',contentType:'video/webm',chunk64:btoa(binary)})}));
          }
        }
        const rec720 = await recordStress({width:1280,height:720,fps:30,seconds:20,bitrate:4000000});
        const stream720 = await streamingStress({width:1280,height:720,fps:30,seconds:20,bitrate:4000000});
        resolve({ support, rec720, stream720 });
      } catch(e) { reject(e.message || String(e)); }
    })`;
    const evalResult = await Runtime.evaluate({ expression, awaitPromise:true, returnByValue:true, timeout:180000 });
    if (evalResult.exceptionDetails) throw new Error(JSON.stringify(evalResult.exceptionDetails));
    const value = evalResult.result.value;
    const b64 = value.rec720.base64;
    delete value.rec720.base64;
    fs.writeFileSync(path.join(root, 'youtube-format-speed-result.json'), JSON.stringify(value, null, 2));
    fs.writeFileSync(path.join(root, 'record-720p20s.webm'), Buffer.from(b64, 'base64'));
    console.log(JSON.stringify(value, null, 2));
    await client.close(); chrome.kill('SIGTERM');
  } catch (e) { chrome.kill('SIGTERM'); throw e; }
}
main().catch(e => { console.error(e.stack || e.message); process.exitCode = 1; }).finally(() => api.close());
