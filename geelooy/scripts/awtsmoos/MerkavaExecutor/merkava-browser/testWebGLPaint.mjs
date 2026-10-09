// B"H — verify paintWebgl blits real pixels through the snapshot painter.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { writeFileSync } = require('fs');
const zlib = require('zlib');

const { paintWebgl } = await import('../merkava-service/snapshots/software/canvas-painter/webglWitness.js');
const { Framebuffer } = await import('../merkava-service/snapshots/software/framebuffer.js');
const { VirtualWebGLContext } = require('./VirtualWebGLContext.js');
const { VirtualWebGLTextureArena } = require('./VirtualWebGLTextureArena.js');

const canvas = { width: 160, height: 100, tagName: 'CANVAS', __webglCanvasTexture: null };
const gl = new VirtualWebGLContext(canvas, new VirtualWebGLTextureArena(), { version: 1 });
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, 'attribute vec4 p; void main(){ gl_Position = p; }');
gl.compileShader(vs);
const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, 'precision mediump float; void main(){ gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); }');
gl.compileShader(fs);
const pr = gl.createProgram();
gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
const loc = gl.getAttribLocation(pr, 'p');
const b = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, b);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0.8, 0, -0.8, -0.8, 0, 0.8, -0.8, 0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);

const tex = canvas.__webglCanvasTexture;
console.log('has glPixels:', !!tex.glPixels);

const fb = new Framebuffer(160, 100);
paintWebgl(fb, tex, { x: 0, y: 0, w: 160, h: 100 });

// encode fb to PNG (framebuffer stores RGBA bytes; check field name)
const d = fb.data || fb.pixels || fb.buf;
console.log('fb buffer:', d?.constructor?.name, d?.length);
let green = 0;
for (let i = 0; i < d.length; i += 4) if (d[i + 1] > 200 && d[i] < 80) green++;
console.log('green pixels:', green);
