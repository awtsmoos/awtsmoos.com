// B"H
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const port = 18085;
const unique = 'AWTS_NO_RAW_BYTECODE_RENDER_18085';

const html = `<!doctype html><body>
  <h1>${unique}</h1>
  <script>console.log('THIS_SCRIPT_TEXT_MUST_NOT_BE_RENDERED_AS_PAGE_BODY');</script>
</body>`;

const serverCode = `
const http = require('http');
const html = ${JSON.stringify(html)};
http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}).listen(${port}, '127.0.0.1', () => console.log('READY'));
`;

function assertHas(text, needle) {
  if (!text.includes(needle)) throw new Error(`missing ${needle}\n${text}`);
}
function assertNotHas(text, needle) {
  if (text.includes(needle)) throw new Error(`forbidden ${needle}\n${text}`);
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
  const stdout = execFileSync(exe, ['--render-test', `http://127.0.0.1:${port}`], {
    cwd: dist,
    encoding: 'utf8',
    timeout: 20000
  });
  assertHas(stdout, unique);
  assertHas(stdout, 'pageKind=network-html-dynamic');
  assertHas(stdout, 'awts-render-decision route=dynamic-network result=drawn source=network-fetched');
  assertNotHas(stdout, 'THIS_SCRIPT_TEXT_MUST_NOT_BE_RENDERED_AS_PAGE_BODY');
  assertNotHas(stdout, 'console.log');
  assertNotHas(stdout, '�');
  assertNotHas(stdout, 'route=executor-stream result=drawn');
  console.log(JSON.stringify({ ok: true, kind: 'network-no-raw-bytecode-render', stdout }, null, 2));
} finally {
  server.kill();
}
