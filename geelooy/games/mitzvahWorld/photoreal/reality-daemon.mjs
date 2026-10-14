// B"H — Reality Engine render daemon.
// Keeps a warm headless Chrome alive so every render completes in seconds:
// no browser launch, no cold module load per render. The page renders and
// POSTs PNG pixels directly (no CDP screenshot stalls).
//
//   node reality-daemon.mjs [--port 19311]
//   POST /render {"view":"forest","w":960,"h":600} -> PNG bytes
//   GET  /health -> {"ok":true,"renders":N}
//
// A tiny client (reality-render.mjs) auto-starts the daemon on first use.
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile, appendFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LOG = '/tmp/reality-daemon.log';
const log = (...a) => {
  const line = new Date().toISOString().slice(11, 19) + ' ' + a.join(' ') + '\n';
  process.stdout.write(line);
  appendFile(LOG, line).catch(() => {});
};

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BROWSER_DIR = path.join(HERE, '..', 'experiments', 'Awtsmoos', 'src', 'test', 'browser');
const { freeBrowserProofPort, waitForBrowserProofUrl } = await import(path.join(BROWSER_DIR, 'BrowserProofLifecycle.mjs'));
const { connectCdpSocket, sendCdpCommand } = await import(path.join(BROWSER_DIR, 'BrowserCdpSocket.mjs'));

const PAGE = 'file://' + path.join(HERE, 'reality.html');
const PORT = Number(process.argv.find(a => a.startsWith('--port='))?.split('=')[1] || process.env.REALITY_DAEMON_PORT || 19311);

const t0 = Date.now();
const cdpPort = await freeBrowserProofPort();
const profile = await mkdtemp(path.join(os.tmpdir(), 'mw-reality-daemon-'));
const chrome = spawn('/opt/meta-chromium/chrome', ['--headless=new', '--no-sandbox',
  '--proxy-server=http://hatch-egress-proxy:3128', '--allow-file-access-from-files',
  '--use-gl=swiftshader', '--enable-unsafe-swiftshader',
  '--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${cdpPort}`,
  `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=960,600', 'about:blank'], { stdio: ['ignore', 'pipe', 'pipe'] });
chrome.stderr.on('data', () => {});
const cleanup = async () => {
  try { sock.close(); } catch {}
  chrome.kill('SIGKILL');
  await rm(profile, { force: true, recursive: true }).catch(() => {});
};
process.on('SIGTERM', async () => { await cleanup(); process.exit(0); });
process.on('SIGINT', async () => { await cleanup(); process.exit(0); });

let sock;
await waitForBrowserProofUrl(`http://127.0.0.1:${cdpPort}/json/version`, chrome, 45000);
const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
const blank = list.find(x => x.type === 'page');
sock = await connectCdpSocket(blank.webSocketDebuggerUrl);
const psend = (m, p = {}, to = 60000) => sendCdpCommand(sock, m, p, to);
// B"H — perf mission: in headless=new, Page.navigate to a new document can
// invalidate the startup CDP socket (it was opened on about:blank). After any
// navigate, re-list targets and reconnect to the live file:// page target.
async function reconnectPageSocket() {
  // Retry: right after navigate there can be transient duplicate targets.
  let lastErr = null;
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${cdpPort}/json/list`)).json();
      const pages = list.filter(x => x.type === 'page' && x.url.includes('reality.html'));
      if (!pages.length) throw new Error('no reality.html page target');
      // prefer the most recently opened target (highest id ordering = last)
      const page = pages[pages.length - 1];
      try { sock.close(); } catch {}
      sock = await connectCdpSocket(page.webSocketDebuggerUrl);
      await sendCdpCommand(sock, 'Page.enable', {}, 15000);
      // verify the socket actually talks to a live page
      const v = await sendCdpCommand(sock, 'Runtime.evaluate',
        { expression: '1+1', returnByValue: true }, 15000);
      if (v && v.result && v.result.value === 2) return;
      throw new Error('socket verify failed');
    } catch (e) { lastErr = e; await new Promise(r => setTimeout(r, 2000)); }
  }
  throw new Error('reconnectPageSocket failed: ' + String(lastErr && lastErr.message || lastErr));
}
await psend('Page.enable');
log(`B"H reality-daemon: chrome warm in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// pending renders: signalPort -> {resolve, reject, timer}
const pending = new Map();
let renderCount = 0;

const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (req.method === 'OPTIONS') { res.writeHead(200, cors); res.end(); return; }

  // Page delivers PNG pixels here.
  if (req.url && req.url.startsWith('/png')) {
    const u = new URL(req.url, 'http://x');
    const sp = u.searchParams.get('sp');
    try {
      const marks = JSON.parse(u.searchParams.get('t') || '[]');
      if (marks.length) {
        let prev = 0;
        log(` in-page phases for sp=${sp}:`);
        for (const [name, t] of marks) {
          log(`   ${name}: ${t.toFixed(2)}s (+${(t - prev).toFixed(2)}s)`);
          prev = t;
        }
      }
    } catch {}
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const p = sp && pending.get(Number(sp));
      res.writeHead(200, { ...cors, 'Content-Type': 'text/plain' });
      res.end('ok');
      if (p) { pending.delete(Number(sp)); clearTimeout(p.timer); p.resolve(Buffer.concat(chunks)); }
    });
    return;
  }
  // Page reports a render error here.
  if (req.url && req.url.startsWith('/err')) {
    const u = new URL(req.url, 'http://x');
    const sp = Number(u.searchParams.get('sp'));
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      res.writeHead(200, cors); res.end('ok');
      const p = pending.get(sp);
      if (p) { pending.delete(sp); clearTimeout(p.timer); p.reject(new Error('page: ' + body.slice(0, 300))); }
    });
    return;
  }
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, renders: renderCount, uptime_s: Math.round((Date.now() - t0) / 1000) }));
    return;
  }
  // B"H — perf stats endpoint (§21 budget, commit 10 GATE).
  if (req.url === '/stats' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { view = 'forest' } = JSON.parse(body || '{}');
        await psend('Page.navigate', { url: `${PAGE}?view=${encodeURIComponent(view)}&fast=1&stats=1` });
        await new Promise(r => setTimeout(r, 3000));
        await reconnectPageSocket();
        // wait for scene build (poll for __realityDebug)
        let stats = null;
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 2000));
          const res = await psend('Runtime.evaluate', {
            expression: `window.__realityDebug && window.__realityDebug.getPerfStats ? JSON.stringify(window.__realityDebug.getPerfStats()) : null`,
            returnByValue: true,
          }).catch(() => null);
          const val = res && res.result && res.result.value;
          if (val) { stats = JSON.parse(val); break; }
        }
        if (!stats) throw new Error('stats not available');
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, stats }));
      } catch (e) {
        res.writeHead(500, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e).slice(0, 300) }));
      }
    });
    return;
  }
  if (req.url === '/bench' && req.method === 'POST') {
    // B"H — frame-time benchmark (§21 gate, CPU 60fps mission).
    // Creates a FRESH page target per bench (Target.createTarget) because
    // heavy SwiftShader renders destabilize reused pages. Navigates once,
    // waits for the built scene, then times N raw renderer.render() calls
    // in-page (no PNG readback in the loop). Closes the target after.
    // Body: {view, w, h, frames, fast, shadow: 'dynamic'|'static', rs}
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      let targetId = null;
      try {
        const { view = 'forest', w = 1920, h = 1080, frames = 40, fast = 0, shadow = 'dynamic', shadowEvery = 1, rs = 0.75 } = JSON.parse(body || '{}');
        // B"H — reuse the daemon's page like /render does (proven reliable):
        // set viewport, navigate, then reconnect the CDP socket to the live
        // target (the startup socket dies on cross-document navigation).
        await psend('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }).catch(() => {});
        await psend('Page.navigate', { url: `${PAGE}?view=${encodeURIComponent(view)}${fast ? '&fast=1' : ''}&rs=${rs}` });
        await new Promise(r => setTimeout(r, 3000));
        await reconnectPageSocket();
        let ready = false, pageErr = null, dbgPolled = 0;
        for (let i = 0; i < 200; i++) {
          await new Promise(r => setTimeout(r, 2000));
          let chkErr = null;
          const chk = await psend('Runtime.evaluate', {
            expression: `window.__realityError ? 'ERR:' + String(window.__realityError).slice(0,300) : (!!(window.__realityDebug && window.__realityDebug.renderer) ? 'READY' : 'WAIT')`,
            returnByValue: true,
          }).catch((e) => { chkErr = String(e && e.message || e); return null; });
          const cv = chk && chk.result && chk.result.value;
          dbgPolled++;
          if (dbgPolled <= 3 || dbgPolled % 30 === 0) log(`bench poll #${dbgPolled}: cv=${JSON.stringify(cv)} err=${chkErr}`);
          if (cv === 'READY') { ready = true; break; }
          if (cv && cv.startsWith('ERR:')) { pageErr = cv.slice(4); break; }
        }
        if (pageErr) throw new Error('page build error: ' + pageErr);
        if (!ready) throw new Error('scene not ready for bench');
        const dynShadow = shadow === 'dynamic';
        const SE = Math.max(1, shadowEvery | 0);
        const expr = `(function(){
          const D = window.__realityDebug;
          const R = D.renderer;
          // shadow throttling: needsUpdate every SE-th frame (game-realistic)
          R.shadowMap.autoUpdate = false;
          const times = [];
          for (let i = 0; i < 5; i++) { R.shadowMap.needsUpdate = true; R.render(D.scene, D.camera); }
          R.info.autoReset = false;
          R.info.reset();
          for (let i = 0; i < ${frames}; i++) {
            if (${dynShadow} && (i % ${SE} === 0)) R.shadowMap.needsUpdate = true;
            const t0 = performance.now();
            R.render(D.scene, D.camera);
            times.push(performance.now() - t0);
          }
          const info = R.info.render;
          R.info.autoReset = true;
          times.sort((a,b)=>a-b);
          const q = p => times[Math.min(times.length-1, Math.floor(p*times.length))];
          return JSON.stringify({
            frames: ${frames},
            p50: +q(0.5).toFixed(2), p95: +q(0.95).toFixed(2),
            mean: +(times.reduce((a,b)=>a+b,0)/times.length).toFixed(2),
            max: +times[times.length-1].toFixed(2),
            drawCalls: Math.round(info.calls/${frames}),
            triangles: Math.round(info.triangles/${frames})
          });
        })()`;
        const ev = await psend('Runtime.evaluate', { expression: expr, returnByValue: true }, 300000);
        const val = ev && ev.result && ev.result.value;
        if (!val) throw new Error('bench eval failed');
        res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, bench: JSON.parse(val), shadow, shadowEvery: SE, w, h, fast, rs }));
      } catch (e) {
        res.writeHead(500, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e).slice(0, 300) }));
      } finally {
        // free the heavy SwiftShader page so the next bench starts clean
        if (targetId) {
          try {
            const ver = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
            const bsock = await connectCdpSocket(ver.webSocketDebuggerUrl);
            await sendCdpCommand(bsock, 'Target.closeTarget', { targetId }, 15000).catch(() => {});
            try { bsock.close(); } catch {}
          } catch {}
        }
      }
    });
    return;
  }
  if (req.url === '/render' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      const tR0 = Date.now();
      try {
        const { view = 'forest', w = 960, h = 600 } = JSON.parse(body || '{}');
        // dedicated signal id for this render
        const sp = Math.floor(Math.random() * 1e9);
        const pngPromise = new Promise((resolve, reject) => {
          // B"H — 2026-10-14: renders slowed to ~180s (SwiftShader readpixels
          // stall + denser leaves). 120s was timing out valid renders.
          const timer = setTimeout(() => { pending.delete(sp); reject(new Error('render timeout 300s')); }, 300000);
          pending.set(sp, { resolve, reject, timer });
        });
        // resize viewport for this render BEFORE navigation (page reads innerWidth at build)
        await psend('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }).catch(() => {});
        // navigate the warm page (modules cached after first render)
        await psend('Page.navigate', { url: `${PAGE}?view=${encodeURIComponent(view)}&fast=1&signalPort=${daemonPort}&sp=${sp}` });
        const png = await pngPromise;
        renderCount++;
        res.writeHead(200, { ...cors, 'Content-Type': 'image/png', 'X-Render-Ms': String(Date.now() - tR0) });
        res.end(png);
      } catch (e) {
        res.writeHead(500, { ...cors, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e.message || e).slice(0, 300) }));
      }
    });
    return;
  }
  res.writeHead(404, cors); res.end('nope');
});

let daemonPort = PORT;
await new Promise(r => server.listen(PORT, '127.0.0.1', r));
daemonPort = server.address().port;
// write the port file so clients can find us
await writeFile('/tmp/reality-daemon.port', String(daemonPort));
log(`B"H reality-daemon listening on 127.0.0.1:${daemonPort} (port file /tmp/reality-daemon.port)`);
