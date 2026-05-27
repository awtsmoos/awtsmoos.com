// B"H
import { spawn, execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const exe = path.join(here, 'dist', 'merkavaapp.exe');
const dist = path.join(here, 'dist');
const port = 18084;
const unique = 'AWTS_NATIVE_WEBGL_OPENGL_RENDER_18084';

const html = `<!doctype html><body>
  <canvas id="stage" width="320" height="180"></canvas>
  <p>${unique}</p>
  <script>
    const gl = document.querySelector('#stage').getContext('webgl');
    gl.viewport(0,0,320,180);
    gl.clearColor(0.2,0.1,0.3,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,3);
  </script>
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
  assertHas(stdout, 'render-test-start url=http://127.0.0.1:18084');
  assertHas(stdout, 'pageKind=network-executor-render-stream');
  assertHas(stdout, 'webgl.drawArrays=1');
  assertHas(stdout, 'opengl_renderer=');
  assertHas(stdout, 'awts-opengl-render-stream-draw source=network-executor-render-stream');
  assertHas(stdout, 'awts-opengl-webgl-draw source=network-executor-render-stream');
  assertHas(stdout, 'drawArrays=1');
  assertHas(stdout, 'glError=0');
  assertHas(stdout, 'render-test-end frames=8');
  assertNotHas(stdout, 'pageKind=network-webgl-dynamic');
  assertNotHas(stdout, 'route=dynamic-network');
  console.log(JSON.stringify({ ok: true, kind: 'native-webgl-opengl-render', stdout }, null, 2));
} finally {
  server.kill();
}
