// B"H
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const port = 18086;

const html = `<!doctype html><html><head><link rel="stylesheet" href="/style.css"></head><body><main class="shell"><h1>AWTS_LINKED_CSS_TITLE</h1><nav><a>One</a><a>Two</a><a>Three</a></nav><section class="hero">AWTS_LINKED_CSS_HERO</section></main></body></html>`;
const css = `body{margin:0;padding:20px;background-color:#223344;color:#eeeeee}.shell{width:640px;padding:24px;background-color:#112233;color:#ffffff}h1{font-size:32px;color:#ffcc00;margin:0 0 16px 0}nav{display:flex;gap:12px;background-color:#334455;padding:10px}a{display:inline;width:96px;color:#00ff99}.hero{width:520px;height:90px;margin-top:20px;background-color:#446688;color:#ffffff;padding:18px}`;

const serverCode = `
const http = require('http');
const html = ${JSON.stringify(html)};
const css = ${JSON.stringify(css)};
http.createServer((req, res) => {
  if (req.url === '/style.css') { res.writeHead(200, { 'content-type': 'text/css' }); res.end(css); return; }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(html);
}).listen(${port}, '127.0.0.1', () => console.log('READY'));
`;

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not become ready')), 8000);
    child.stdout.on('data', chunk => { if (String(chunk).includes('READY')) { clearTimeout(timer); resolve(); } });
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.on('exit', code => reject(new Error(`server exited before ready: ${code}`)));
  });
}
function assertHas(text, needle) { if (!text.includes(needle)) throw new Error(`missing ${needle}\n${text}`); }
function assertNotHas(text, needle) { if (text.includes(needle)) throw new Error(`forbidden ${needle}\n${text}`); }

const server = spawn(process.execPath, ['-e', serverCode], { stdio: ['ignore', 'pipe', 'pipe'] });
try {
  await waitForReady(server);
  const stdout = execFileSync(exe, ['--render-test', `http://127.0.0.1:${port}`], { cwd: dist, encoding: 'utf8', timeout: 30000 });
  assertHas(stdout, 'awts-executor-compile-ok');
  assertHas(stdout, 'cssLinks');
  assertHas(stdout, 'pageKind=network-executor-render-stream');
  assertHas(stdout, 'awts-opengl-render-stream-draw source=network-executor-render-stream');
  assertHas(stdout, 'glError=0');
  assertHas(stdout, 'boxes=');
  assertHas(stdout, 'texts=');
  assertNotHas(stdout, 'pageKind=network-html-dynamic');
  assertNotHas(stdout, 'AWTS_LINKED_CSS_TITLE</h1>');
  console.log(JSON.stringify({ ok: true, kind: 'linked-css-executor-render', stdout }, null, 2));
} finally { server.kill(); }
