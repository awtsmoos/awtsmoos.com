// B"H — Reality Engine one-shot render client.
// Usage: node reality-render.mjs <view> <out.png> [WIDTHxHEIGHT]
// Auto-starts the daemon (warm Chrome) on first use; every render after the
// first completes in seconds.
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT_FILE = '/tmp/reality-daemon.port';
const view = process.argv[2] || 'forest';
const out = process.argv[3] || `/home/hatch/workspace/reality-shots/final/reality-${view}.png`;
const [W, H] = (process.argv[4] || '960x600').split('x').map(Number);

const t0 = Date.now();

async function daemonPort() {
  try {
    const p = Number((await readFile(PORT_FILE, 'utf8')).trim());
    if (p > 0) {
      const h = await fetch(`http://127.0.0.1:${p}/health`).then(r => r.json()).catch(() => null);
      if (h && h.ok) return p;
    }
  } catch {}
  return 0;
}

let port = await daemonPort();
if (!port) {
  console.log('starting reality-daemon (one-time warm-up)...');
  const child = spawn('node', [path.join(HERE, 'reality-daemon.mjs')], {
    detached: true, stdio: 'ignore',
  });
  child.unref();
  // wait for the port file + health
  for (let i = 0; i < 100; i++) {
    await new Promise(r => setTimeout(r, 500));
    port = await daemonPort();
    if (port) break;
  }
  if (!port) throw new Error('daemon failed to start');
  console.log(`daemon warm in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

const res = await fetch(`http://127.0.0.1:${port}/render`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ view, w: W, h: H }),
});
if (!res.ok) {
  const err = await res.text().catch(() => res.statusText);
  throw new Error(`render failed: ${err.slice(0, 300)}`);
}
const png = Buffer.from(await res.arrayBuffer());
await mkdir(path.dirname(out), { recursive: true });
await writeFile(out, png);
const ms = res.headers.get('x-render-ms');
console.log(`SAVED ${out} (${(png.length / 1024).toFixed(0)}KB) in ${((Date.now() - t0) / 1000).toFixed(1)}s (server render: ${ms}ms)`);
