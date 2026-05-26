// B"H
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const port = 18080;

const serverCode = `
const http = require('http');
const html = ${JSON.stringify(`<!doctype html>
<body>
  <canvas id="stage" width="320" height="180"></canvas>
  <script>
    const gl = document.querySelector('#stage').getContext('webgl');
    gl.viewport(0, 0, 320, 180);
    gl.clearColor(0.1, 0.2, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  </script>
</body>`)};
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
});
server.listen(${port}, '127.0.0.1', () => console.log('READY'));
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
  assertHas('localhost-webgl-dom', stdout, 'status=network loaded: http://127.0.0.1:18080');
  assertHas('localhost-webgl-dom', stdout, 'pageKind=merkava-executor-render-stream');
  assertHas('localhost-webgl-dom', stdout, 'nativeDom=disabled');
  assertHas('localhost-webgl-dom', stdout, 'network WebGL DOM routed through MerkavaExecutor render stream');
  assertNotHas('localhost-webgl-dom', stdout, '<canvas');
  console.log(JSON.stringify({ ok: true, stdout }, null, 2));
} finally {
  server.kill();
}
