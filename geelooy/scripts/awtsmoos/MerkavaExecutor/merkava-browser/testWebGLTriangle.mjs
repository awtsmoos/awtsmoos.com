// B"H — WebGL triangle proof: real API -> real GLSL compile -> real rasterization.
// PNG encoded from scratch (zlib + manual chunks + CRC32). No image deps.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { writeFileSync } = require('fs');
const zlib = require('zlib');

const { VirtualWebGLContext } = require('./VirtualWebGLContext.js');
const { VirtualWebGLTextureArena } = require('./VirtualWebGLTextureArena.js');

// ---- minimal PNG encoder from scratch ----
const CRC_TABLE = (() => {
	const t = new Int32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
		t[n] = c;
	}
	return t;
})();
function crc32(buf) {
	let c = 0xFFFFFFFF;
	for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
	return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
	const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
	const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([len, body, crc]);
}
function encodePngRGBA(w, h, rgba) {
	const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
	const ihdr = Buffer.alloc(13);
	ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
	ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
	const raw = Buffer.alloc(h * (1 + w * 4));
	for (let y = 0; y < h; y++) {
		raw[y * (1 + w * 4)] = 0; // filter: none
		Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4)
			.copy(raw, y * (1 + w * 4) + 1);
	}
	const idat = zlib.deflateSync(raw, { level: 6 });
	return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- the WebGL program (exactly what page JS would run) ----
function runTriangle(gl) {
	const vsSrc = `
		attribute vec4 a_position;
		void main() {
			gl_Position = a_position;
		}`;
	const fsSrc = `
		precision mediump float;
		void main() {
			gl_FragColor = vec4(1.0, 0.2, 0.1, 1.0);
		}`;
	const vs = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vs, vsSrc);
	gl.compileShader(vs);
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
		throw new Error('vertex compile failed: ' + gl.getShaderInfoLog(vs));
	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fs, fsSrc);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
		throw new Error('fragment compile failed: ' + gl.getShaderInfoLog(fs));
	const prog = gl.createProgram();
	gl.attachShader(prog, vs);
	gl.attachShader(prog, fs);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
		throw new Error('link failed: ' + gl.getProgramInfoLog(prog));
	gl.useProgram(prog);

	const posLoc = gl.getAttribLocation(prog, 'a_position');
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
		0.0, 0.6, 0.0,
		-0.6, -0.5, 0.0,
		0.6, -0.5, 0.0,
	]), gl.STATIC_DRAW);
	gl.enableVertexAttribArray(posLoc);
	gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0.05, 0.07, 0.16, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	return gl.getError() === gl.NO_ERROR;
}

// ---- run ----
const W = 320, H = 200;
const canvas = { width: W, height: H, tagName: 'CANVAS', __webglCanvasTexture: null };
const arena = new VirtualWebGLTextureArena();
const gl = new VirtualWebGLContext(canvas, arena, { version: 1 });

const t0 = Date.now();
const ok = runTriangle(gl);
const ms = Date.now() - t0;
const px = canvas.__webglCanvasTexture.glPixels;
if (!px || !px.data) throw new Error('no pixels produced');

const png = encodePngRGBA(px.width, px.height, px.data);
const outPath = '/home/hatch/workspace/merkava-screenshots/webgl-triangle.png';
writeFileSync(outPath, png);

// verify: count non-background pixels + sample triangle center
let nonBg = 0;
const bgR = 13, bgG = 18, bgB = 41;
for (let i = 0; i < px.data.length; i += 4) {
	if (Math.abs(px.data[i] - bgR) > 8 || Math.abs(px.data[i + 1] - bgG) > 8 || Math.abs(px.data[i + 2] - bgB) > 8) nonBg++;
}
const cx = (100 * W + 160) * 4; // center-ish of triangle
console.log(JSON.stringify({
	ok, ms,
	size: `${px.width}x${px.height}`,
	pngBytes: png.length,
	nonBackgroundPixels: nonBg,
	centerPixel: [px.data[cx], px.data[cx + 1], px.data[cx + 2], px.data[cx + 3]],
	out: outPath,
}, null, 1));
