// B"H
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const port = 18083;
const unique = 'AWTS_DYNAMIC_URL_CONTENT_18083';

const html = `<!doctype html>
<body>
  <main>
    <h1>${unique}</h1>
    <p>This text must come from the HTTP response, not from the baked sample render stream.</p>
  </main>
</body>`;

const serverCode = `
const http = require('http');
const html = ${JSON.stringify(html)};
http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(${port}, '127.0.0.1', () => console.log('READY'));
`;

function assertHas(name, text, needle) {
  if (!text.includes(needle)) throw new Error(`${name} missing ${needle}\n${text}`);
}

function assertNotHas(name, text, needle) {
  if (text.includes(needle)) throw new Error(`${name} must not include ${needle}\n${text}`);
}

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not become ready')), 8000);
    child.stdout.on('data', chunk => {
      if (String(chunk).includes('READY')) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.on('exit', code => reject(new Error(`server exited before ready: ${code}`)));
  });
}

const server = spawn(process.execPath, ['-e', serverCode], { stdio: ['ignore', 'pipe', 'pipe'] });
try {
  await waitForReady(server);
  const stdout = execFileSync(exe, ['--nav-test', `http://127.0.0.1:${port}`], {
    cwd: dist,
    encoding: 'utf8',
    timeout: 15000
  });
  assertHas('network-fetched-html', stdout, 'awts-net-read url=http://127.0.0.1:18083');
  assertHas('network-fetched-html', stdout, 'awts-route-decision route=network-html-dynamic reason=fetched-html-no-webgl');
  assertHas('network-fetched-html', stdout, 'pageKind=network-html-dynamic');
  assertHas('network-fetched-html', stdout, unique);
  assertNotHas('network-fetched-html', stdout, 'route=merkava-executor-render-stream reason=local-http-forced');
  assertNotHas('network-fetched-html', stdout, 'route=executor-stream result=drawn');
  assertNotHas('network-fetched-html', stdout, 'preview=network WebGL DOM routed through MerkavaExecutor render stream');
  console.log(JSON.stringify({ ok: true, url: `http://127.0.0.1:${port}`, unique, stdout }, null, 2));
} finally {
  server.kill();
}
