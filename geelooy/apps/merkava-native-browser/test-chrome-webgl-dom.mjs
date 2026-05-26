// B"H
import { spawn, execFileSync } from 'child_process';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const html = `<!doctype html>
<body>
  <canvas id="stage" width="320" height="180"></canvas>
  <pre id="report"></pre>
  <script>
    const canvas = document.querySelector('#stage');
    const gl = canvas.getContext('webgl');
    let ok = !!gl;
    let shaderOk = false;
    let drawOk = false;
    if (gl) {
      const vertex = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertex, 'attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }');
      gl.compileShader(vertex);
      const fragment = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragment, 'void main(){ gl_FragColor = vec4(1.0,0.0,0.0,1.0); }');
      gl.compileShader(fragment);
      const program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.useProgram(program);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, 0,1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.viewport(0, 0, 320, 180);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      shaderOk = gl.getShaderParameter(vertex, gl.COMPILE_STATUS) && gl.getShaderParameter(fragment, gl.COMPILE_STATUS) && gl.getProgramParameter(program, gl.LINK_STATUS);
      drawOk = gl.getError() === gl.NO_ERROR;
    }
    document.querySelector('#report').textContent = JSON.stringify({ ok, shaderOk, drawOk, canvas: !!canvas });
  </script>
</body>`;

const serverCode = `
const http = require('http');
const html = ${JSON.stringify(html)};
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
});
server.listen(0, '127.0.0.1', () => console.log('READY:' + server.address().port));
`;

function waitForReady(child) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('server did not become ready')), 8000);
    child.stdout.on('data', chunk => {
      const text = String(chunk);
      const match = text.match(/READY:(\d+)/);
      if (match) {
        clearTimeout(timer);
        resolve(Number(match[1]));
      }
    });
    child.stderr.on('data', chunk => process.stderr.write(chunk));
    child.on('exit', code => reject(new Error(`server exited before ready: ${code}`)));
  });
}

const server = spawn(process.execPath, ['-e', serverCode], { stdio: ['ignore', 'pipe', 'pipe'] });
try {
  const port = await waitForReady(server);
  const dom = execFileSync(chrome, ['--headless=new', '--disable-gpu', '--dump-dom', `http://127.0.0.1:${port}/`], {
    encoding: 'utf8',
    timeout: 30000
  });
  for (const needle of ['"ok":true', '"shaderOk":true', '"drawOk":true', '"canvas":true']) {
    if (!dom.includes(needle)) throw new Error(`chrome webgl dom missing ${needle}\n${dom}`);
  }
  console.log(JSON.stringify({ ok: true, chrome: true, url: `http://127.0.0.1:${port}/`, report: { ok: true, shaderOk: true, drawOk: true, canvas: true } }, null, 2));
} finally {
  server.kill();
}
