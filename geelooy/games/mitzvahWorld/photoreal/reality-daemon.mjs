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
          const timer = setTimeout(() => { pending.delete(sp); reject(new Error('render timeout 120s')); }, 120000);
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
