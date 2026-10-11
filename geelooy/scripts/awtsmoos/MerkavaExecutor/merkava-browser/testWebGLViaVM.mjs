// B"H — WebGL through the real Merkava VM, verified via pixels (not the
// runner's result field, which a sibling worker's in-flight VM edits
// currently leave undefined — not my files, not touching them).
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { runJsCode } = require('../merkava-binary/MerkavaJsRunner.js');
const { VirtualOffscreenCanvas } = require('./VirtualOffscreenCanvas.js');

const src = `
function drawTriangle() {
  var canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 200;
  var gl = canvas.getContext('webgl');
  var vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, 'attribute vec4 a_position; void main() { gl_Position = a_position; }');
  gl.compileShader(vs);
  var fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, 'precision mediump float; void main() { gl_FragColor = vec4(0.2, 0.8, 1.0, 1.0); }');
  gl.compileShader(fs);
  var prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);
  var loc = gl.getAttribLocation(prog, 'a_position');
  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.6, 0, -0.6, -0.5, 0, 0.6, -0.5, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
  gl.clearColor(0.05, 0.07, 0.16, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  window.__vmErr = gl.getError();
  window.__vmLinked = gl.getProgramParameter(prog, gl.LINK_STATUS);
}
drawTriangle();
`;

const created = [];
const window = {};
const document = {
  createElement(tag) { const c = new VirtualOffscreenCanvas(320, 200, null); created.push(c); return c; }
};

const t0 = Date.now();
const res = await runJsCode(src, { globals: { document, window } });
const ms = Date.now() - t0;

// verify via the canvas pixels the VM code drew into
const canvas = created[0];
const tex = canvas && canvas.__webglCanvasTexture;
const px = tex && tex.glPixels;
let cyan = 0;
if (px) {
  const d = px.data;
  for (let i = 0; i < d.length; i += 4)
    if (d[i + 2] > 200 && d[i] < 120 && d[i + 1] > 120) cyan++;
}
console.log(JSON.stringify({
  vmOk: res.ok, vmStatus: res.status, ms,
  vmErr: window.__vmErr, vmLinked: window.__vmLinked,
  canvases: created.length,
  cyanPixels: cyan,
  verdict: res.ok && window.__vmErr === 0 && window.__vmLinked === true && cyan > 5000 ? 'VM-TRIANGLE-OK' : 'VM-FAIL',
}));
