// B"H — render the varying/builtin test to PNG for visual check.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { writeFileSync } = require('fs');
const zlib = require('zlib');
const { VirtualWebGLContext } = require('./VirtualWebGLContext.js');
const { VirtualWebGLTextureArena } = require('./VirtualWebGLTextureArena.js');

const CRC_TABLE = (() => {
	const t = new Int32Array(256);
	for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; }
	return t;
})();
function crc32(b) { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(t, d) {
	const l = Buffer.alloc(4); l.writeUInt32BE(d.length, 0);
	const body = Buffer.concat([Buffer.from(t, 'ascii'), d]);
	const c = Buffer.alloc(4); c.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([l, body, c]);
}
function png(w, h, rgba) {
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
	ihdr[8] = 8; ihdr[9] = 6;
	const raw = Buffer.alloc(h * (1 + w * 4));
	for (let y = 0; y < h; y++) { raw[y * (1 + w * 4)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (1 + w * 4) + 1); }
	return Buffer.concat([Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const canvas = { width: 320, height: 200, tagName: 'CANVAS', __webglCanvasTexture: null };
const gl = new VirtualWebGLContext(canvas, new VirtualWebGLTextureArena(), { version: 1 });
const vs = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vs, `attribute vec4 a_pos; attribute vec3 a_col; uniform mat4 u_mvp; varying vec3 v_col;
void main() { v_col = a_col; gl_Position = u_mvp * a_pos; }`);
gl.compileShader(vs);
const fs = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fs, `precision mediump float; varying vec3 v_col; uniform float u_time;
void main() { vec3 c = mix(v_col, vec3(1.0) - v_col, 0.5 + 0.5 * sin(u_time)); gl_FragColor = vec4(c, 1.0); }`);
gl.compileShader(fs);
const pr = gl.createProgram();
gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr); gl.useProgram(pr);
const pl = gl.getAttribLocation(pr, 'a_pos'), cl = gl.getAttribLocation(pr, 'a_col');
const pb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, pb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0.7,0, -0.7,-0.6,0, 0.7,-0.6,0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 0, 0);
const cb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, cb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,0,0, 0,1,0, 0,0,1]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(cl); gl.vertexAttribPointer(cl, 3, gl.FLOAT, false, 0, 0);
gl.uniformMatrix4fv(gl.getUniformLocation(pr, 'u_mvp'), false, new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]));
gl.uniform1f(gl.getUniformLocation(pr, 'u_time'), 1.5707);
gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
gl.drawArrays(gl.TRIANGLES, 0, 3);
const px = canvas.__webglCanvasTexture.glPixels;
writeFileSync('/home/hatch/workspace/merkava-screenshots/webgl-gradient.png', png(px.width, px.height, px.data));
console.log('saved webgl-gradient.png, err:', gl.getError());
