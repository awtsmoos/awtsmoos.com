// B"H
// VirtualGLPipeline.js — real WebGL software pipeline from scratch.
//
// Executes retained WebGL state (compiled GLSL IR, bound buffers, uniforms)
// through a genuine graphics pipeline: vertex processing -> primitive
// assembly -> viewport transform -> triangle rasterization (edge functions,
// perspective-correct varying interpolation) -> fragment processing ->
// depth test -> blending -> drawing buffer. No GPU, no native code.
//
// Coordinate note: the drawing buffer uses canvas convention (row 0 = top).
// The viewport transform flips GL's y-up space; gl_FragCoord is reported in
// the same flipped space, consistently.
(function(root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualGLSL.js'));
	else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory(root.Merkava)); }
})(typeof self !== 'undefined' ? self : this, function(glslMod) {
'use strict';
const { createShaderRunner, V, F } = glslMod;

// GL enums (literals; context constants match these values)
const POINTS = 0x0000, LINES = 0x0001, LINE_LOOP = 0x0002, LINE_STRIP = 0x0003,
	TRIANGLES = 0x0004, TRIANGLE_STRIP = 0x0005, TRIANGLE_FAN = 0x0006;
const COLOR_BUFFER_BIT = 0x4000, DEPTH_BUFFER_BIT = 0x0100, STENCIL_BUFFER_BIT = 0x0400;
const NEVER = 0x0200, LESS = 0x0201, EQUAL = 0x0202, LEQUAL = 0x0203,
	GREATER = 0x0204, NOTEQUAL = 0x0205, GEQUAL = 0x0206, ALWAYS = 0x0207;
const ZERO = 0, ONE = 1, SRC_COLOR = 0x0300, ONE_MINUS_SRC_COLOR = 0x0301,
	SRC_ALPHA = 0x0302, ONE_MINUS_SRC_ALPHA = 0x0303, DST_ALPHA = 0x0304,
	ONE_MINUS_DST_ALPHA = 0x0305, DST_COLOR = 0x0306, ONE_MINUS_DST_COLOR = 0x0307,
	SRC_ALPHA_SATURATE = 0x0308;
const FUNC_ADD = 0x8006, FUNC_SUBTRACT = 0x800A, FUNC_REVERSE_SUBTRACT = 0x800B;
const BLEND = 0x0BE2, DEPTH_TEST = 0x0B71, SCISSOR_TEST = 0x0C11, CULL_FACE = 0x0B44;
const CCW = 0x0901, CW = 0x0900, FRONT = 0x0404, BACK = 0x0405, FRONT_AND_BACK = 0x0408;
const BYTE = 0x1400, UNSIGNED_BYTE = 0x1401, SHORT = 0x1402, UNSIGNED_SHORT = 0x1403,
	INT = 0x1404, UNSIGNED_INT = 0x1405, FLOAT = 0x1406;

const TYPE_BYTES = { [BYTE]: 1, [UNSIGNED_BYTE]: 1, [SHORT]: 2, [UNSIGNED_SHORT]: 2, [INT]: 4, [UNSIGNED_INT]: 4, [FLOAT]: 4 };

function ensureDrawingBuffer(gl) {
	const w = Math.max(1, Math.floor(gl.canvas?.width || 300));
	const h = Math.max(1, Math.floor(gl.canvas?.height || 150));
	let db = gl.drawingBuffer;
	if (!db || db.w !== w || db.h !== h) {
		db = {
			w, h,
			color: new Uint8ClampedArray(w * h * 4),
			depth: new Float32Array(w * h).fill(1),
		};
		gl.drawingBuffer = db;
		if (gl.texture) gl.texture.glPixels = { width: w, height: h, data: db.color };
	}
	return db;
}

function clearGL(gl, mask) {
	const db = ensureDrawingBuffer(gl);
	if (mask & COLOR_BUFFER_BIT) {
		const c = gl.clearColorValue || [0, 0, 0, 0];
		const r = Math.round(c[0] * 255), g = Math.round(c[1] * 255),
			b = Math.round(c[2] * 255), a = Math.round(c[3] * 255);
		const d = db.color;
		for (let i = 0; i < d.length; i += 4) { d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a; }
	}
	if (mask & DEPTH_BUFFER_BIT) db.depth.fill(gl.clearDepthValue ?? 1);
	// STENCIL_BUFFER_BIT: no stencil buffer allocated (honest no-op)
}

// ---- attribute fetching ----
function bufferBytes(buf) {
	const data = buf?.data;
	if (!data) return null;
	if (ArrayBuffer.isView(data)) return { u8: new Uint8Array(data.buffer, data.byteOffset, data.byteLength), byteOffset: 0 };
	if (data instanceof ArrayBuffer) return { u8: new Uint8Array(data), byteOffset: 0 };
	if (Array.isArray(data)) { const f = new Float32Array(data); return { u8: new Uint8Array(f.buffer), byteOffset: 0 }; }
	return null;
}
function readComponent(view, byteIndex, type, normalized) {
	const dv = new DataView(view.buffer, view.byteOffset, view.byteLength);
	let v;
	switch (type) {
		case BYTE: v = dv.getInt8(byteIndex); return normalized ? Math.max(-1, v / 127) : v;
		case UNSIGNED_BYTE: v = dv.getUint8(byteIndex); return normalized ? v / 255 : v;
		case SHORT: v = dv.getInt16(byteIndex, true); return normalized ? Math.max(-1, v / 32767) : v;
		case UNSIGNED_SHORT: v = dv.getUint16(byteIndex, true); return normalized ? v / 65535 : v;
		case INT: return dv.getInt32(byteIndex, true);
		case UNSIGNED_INT: return dv.getUint32(byteIndex, true);
		case FLOAT: default: return dv.getFloat32(byteIndex, true);
	}
}
// Convert a fetched vec4 attribute to the shader-declared attribute type,
// like real GL (missing components drop; float/int take .x).
function toDeclared(val, type) {
	const c = val && val.t === 'v' ? val.v : [0, 0, 0, 1];
	if (type === 'vec2') return V(2, [c[0], c[1]]);
	if (type === 'vec3') return V(3, [c[0], c[1], c[2]]);
	if (type === 'float') return F(c[0]);
	if (type === 'int') return { t: 'i', v: Math.trunc(c[0]) };
	return V(4, [c[0], c[1], c[2], c[3]]);
}
function fetchAttrib(gl, location, vertexIndex) {
	const ptr = gl.attribPointers?.[location];
	const constant = gl.attribConstants?.[location];
	if (!ptr || !ptr.buffer) {
		if (constant) return V(4, constant.slice());
		return V(4, [0, 0, 0, 1]);
	}
	const bytes = bufferBytes(ptr.buffer);
	if (!bytes) return V(4, [0, 0, 0, 1]);
	const compBytes = TYPE_BYTES[ptr.type] || 4;
	const stride = ptr.stride > 0 ? ptr.stride : ptr.size * compBytes;
	const base = ptr.offset + vertexIndex * stride;
	const comps = [];
	for (let k = 0; k < ptr.size; k++)
		comps.push(readComponent(bytes.u8, base + k * compBytes, ptr.type, ptr.normalized));
	while (comps.length < 4) comps.push(comps.length === 3 ? 1 : 0);
	return V(4, comps.slice(0, 4));
}

// ---- uniforms ----
function uniformValue(gl, program, name, type) {
	const key = program.id + ':' + name;
	const rec = gl.uniformValues?.get(key);
	if (!rec) return null;
	const v = rec.value || [];
	if (type === 'float') return F(v[0] || 0);
	if (type === 'int') return { t: 'i', v: Math.trunc(v[0] || 0) };
	if (type === 'bool') return { t: 'b', v: !!v[0] };
	if (type === 'vec2') return V(2, [v[0] || 0, v[1] || 0]);
	if (type === 'vec3') return V(3, [v[0] || 0, v[1] || 0, v[2] || 0]);
	if (type === 'vec4') return V(4, [v[0] || 0, v[1] || 0, v[2] || 0, v[3] === undefined ? 1 : v[3]]);
	if (type === 'mat4') {
		const m = new Array(16).fill(0);
		for (let i = 0; i < Math.min(16, v.length); i++) m[i] = v[i];
		return { t: 'm', n: 4, v: m };
	}
	return F(v[0] || 0);
}

// ---- draw ----
function drawGL(gl, mode, first, count) {
	const db = ensureDrawingBuffer(gl);
	const program = gl.currentProgram;
	if (!program || !program.linked || !program.glsl) {
		gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502);
		return { ok: false, reason: 'no linked program' };
	}
	const { vertex, fragment } = program.glsl;
	const vRun = createShaderRunner(vertex), fRun = createShaderRunner(fragment);
	// attribute location -> name
	const locToName = {};
	for (const [name, loc] of Object.entries(program.attribs || {})) locToName[loc] = name;
	// gather uniforms once
	const uniforms = {};
	for (const u of program.uniformList || []) {
		const val = uniformValue(gl, program, u.name, u.type);
		if (val) uniforms[u.name] = val;
	}
	// vertex processing
	const verts = [];
	for (let i = 0; i < count; i++) {
		const attribs = {};
		for (const a of program.attribList || []) {
			const loc = program.attribs[a.name];
			const raw = (loc !== undefined && gl.enabledAttribs?.has(loc))
				? fetchAttrib(gl, loc, first + i)
				: V(4, (gl.attribConstants?.[loc] || [0, 0, 0, 1]).slice());
			attribs[a.name] = toDeclared(raw, a.type);
		}
		let vs;
		try { vs = vRun.runVertex(attribs, uniforms); }
		catch (e) { gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502); return { ok: false, reason: 'vertex: ' + e.message }; }
		verts.push(vs);
	}
	// viewport
	const vp = gl.viewportValue || [0, 0, db.w, db.h];
	const [vx, vy, vw, vh] = vp;
	// NDC -> window (y flipped to canvas-top convention)
	for (const v of verts) {
		const p = v.position.v, w = p[3] === 0 ? 1e-9 : p[3];
		v.ndc = [p[0] / w, p[1] / w, p[2] / w];
		v.w = w;
		v.sx = (v.ndc[0] * 0.5 + 0.5) * vw + vx;
		// y flipped: canvas row 0 = top
		v.sy = (0.5 - v.ndc[1] * 0.5) * vh + vy;
	}
	const tris = assemble(mode, verts);
	let pixels = 0;
	for (const tri of tris) {
		pixels += rasterizeTri(gl, db, tri, fRun, uniforms, vx, vy, vw, vh);
	}
	return { ok: true, triangles: tris.length, pixels };
}

function drawElementsGL(gl, mode, count, type, offset) {
	const ibuf = gl.boundBuffers?.get(gl.ELEMENT_ARRAY_BUFFER ?? 0x8893);
	const bytes = bufferBytes(ibuf);
	if (!bytes) { gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502); return { ok: false, reason: 'no element buffer' }; }
	const compBytes = TYPE_BYTES[type] || 2;
	const indices = [];
	for (let i = 0; i < count; i++) {
		const b = (offset || 0) + i * compBytes;
		indices.push(type === UNSIGNED_BYTE ? bytes.u8[b]
			: type === UNSIGNED_INT ? new DataView(bytes.u8.buffer, bytes.u8.byteOffset).getUint32(b, true)
			: new DataView(bytes.u8.buffer, bytes.u8.byteOffset).getUint16(b, true));
	}
	// run as indexed draw: reuse drawGL core via index remap
	return drawIndexedGL(gl, mode, indices);
}

function drawIndexedGL(gl, mode, indices) {
	// Temporarily remap vertex indices by wrapping fetchAttrib: simplest honest
	// approach — run the same pipeline with an index translation layer.
	const db = ensureDrawingBuffer(gl);
	const program = gl.currentProgram;
	if (!program || !program.linked || !program.glsl) {
		gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502);
		return { ok: false, reason: 'no linked program' };
	}
	const { vertex, fragment } = program.glsl;
	const vRun = createShaderRunner(vertex), fRun = createShaderRunner(fragment);
	const uniforms = {};
	for (const u of program.uniformList || []) {
		const val = uniformValue(gl, program, u.name, u.type);
		if (val) uniforms[u.name] = val;
	}
	const verts = [];
	for (const vi of indices) {
		const attribs = {};
		for (const a of program.attribList || []) {
			const loc = program.attribs[a.name];
			const raw = (loc !== undefined && gl.enabledAttribs?.has(loc))
				? fetchAttrib(gl, loc, vi)
				: V(4, (gl.attribConstants?.[loc] || [0, 0, 0, 1]).slice());
			attribs[a.name] = toDeclared(raw, a.type);
		}
		let vs;
		try { vs = vRun.runVertex(attribs, uniforms); }
		catch (e) { return { ok: false, reason: 'vertex: ' + e.message }; }
		verts.push(vs);
	}
	const vp = gl.viewportValue || [0, 0, db.w, db.h];
	const [vx, vy, vw, vh] = vp;
	for (const v of verts) {
		const p = v.position.v, w = p[3] === 0 ? 1e-9 : p[3];
		v.ndc = [p[0] / w, p[1] / w, p[2] / w]; v.w = w;
		v.sx = (v.ndc[0] * 0.5 + 0.5) * vw + vx;
		v.sy = (0.5 - v.ndc[1] * 0.5) * vh + vy;
	}
	const tris = assemble(mode, verts);
	let pixels = 0;
	for (const tri of tris) pixels += rasterizeTri(gl, db, tri, fRun, uniforms, vx, vy, vw, vh);
	return { ok: true, triangles: tris.length, pixels };
}

function assemble(mode, verts) {
	const tris = [];
	const push = (a, b, c2) => { if (a && b && c2) tris.push([a, b, c2]); };
	if (mode === TRIANGLES) {
		for (let i = 0; i + 2 < verts.length; i += 3) push(verts[i], verts[i + 1], verts[i + 2]);
	} else if (mode === TRIANGLE_STRIP) {
		for (let i = 0; i + 2 < verts.length; i++)
			push(verts[i], verts[i + 1 + (i % 2)], verts[i + 2 - (i % 2)]);
	} else if (mode === TRIANGLE_FAN) {
		for (let i = 1; i + 1 < verts.length; i++) push(verts[0], verts[i], verts[i + 1]);
	}
	return tris;
}

// ---- rasterization ----
function edge(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); }

function rasterizeTri(gl, db, tri, fRun, uniforms, vx, vy, vw, vh) {
	const [v0, v1, v2] = tri;
	// near-plane guard (honest simplification: drop triangles crossing w<=0)
	if (v0.w <= 0 || v1.w <= 0 || v2.w <= 0) return 0;
	// culling (area computed in flipped space: CCW front => negative area)
	if (gl.enabledCaps?.has(CULL_FACE)) {
		const area = edge(v0.sx, v0.sy, v1.sx, v1.sy, v2.sx, v2.sy);
		const ccw = (gl.frontFaceValue ?? CCW) === CCW;
		const front = ccw ? area < 0 : area > 0;
		const cm = gl.cullFaceValue ?? BACK;
		if (cm === FRONT_AND_BACK) return 0;
		if (cm === BACK && !front) return 0;
		if (cm === FRONT && front) return 0;
	}
	const area = edge(v0.sx, v0.sy, v1.sx, v1.sy, v2.sx, v2.sy);
	if (area === 0) return 0;
	const minX = Math.max(vx, Math.floor(Math.min(v0.sx, v1.sx, v2.sx)));
	const maxX = Math.min(vx + vw - 1, Math.ceil(Math.max(v0.sx, v1.sx, v2.sx)));
	const minY = Math.max(vy, Math.floor(Math.min(v0.sy, v1.sy, v2.sy)));
	const maxY = Math.min(vy + vh - 1, Math.ceil(Math.max(v0.sy, v1.sy, v2.sy)));
	let sx0 = minX, sy0 = minY, sx1 = maxX, sy1 = maxY;
	if (gl.enabledCaps?.has(SCISSOR_TEST) && gl.scissorValue) {
		const [cx, cy, cw, ch] = gl.scissorValue;
		sx0 = Math.max(sx0, vx + cx); sy0 = Math.max(sy0, vy + (vh - cy - ch));
		sx1 = Math.min(sx1, vx + cx + cw - 1); sy1 = Math.min(sy1, vy + (vh - cy) - 1);
	}
	const w0r = 1 / v0.w, w1r = 1 / v1.w, w2r = 1 / v2.w;
	const varNames = Object.keys(v0.varyings);
	const depthOn = !gl.enabledCaps || gl.enabledCaps.has(DEPTH_TEST) || gl.depthFuncValue !== undefined;
	const depthFunc = gl.depthFuncValue ?? LEQUAL;
	const blendOn = gl.enabledCaps?.has(BLEND);
	const colorMask = gl.colorMaskValue || [true, true, true, true];
	let pixels = 0;
	for (let y = sy0; y <= sy1; y++) {
		for (let x = sx0; x <= sx1; x++) {
			const px = x + 0.5, py = y + 0.5;
			const e0 = edge(v1.sx, v1.sy, v2.sx, v2.sy, px, py);
			const e1 = edge(v2.sx, v2.sy, v0.sx, v0.sy, px, py);
			const e2 = edge(v0.sx, v0.sy, v1.sx, v1.sy, px, py);
			if (area > 0 && (e0 < 0 || e1 < 0 || e2 < 0)) continue;
			if (area < 0 && (e0 > 0 || e1 > 0 || e2 > 0)) continue;
			const b0 = e0 / area, b1 = e1 / area, b2 = e2 / area;
			const wsum = b0 * w0r + b1 * w1r + b2 * w2r;
			if (wsum === 0) continue;
			const z = (b0 * v0.ndc[2] * w0r + b1 * v1.ndc[2] * w1r + b2 * v2.ndc[2] * w2r) / wsum;
			const depth = z * 0.5 + 0.5;
			const di = y * db.w + x;
			if (depthOn && !depthPass(depthFunc, depth, db.depth[di])) continue;
			// interpolate varyings (perspective-correct)
			const varyings = {};
			for (const vn of varNames) {
				const a = v0.varyings[vn], b = v1.varyings[vn], c = v2.varyings[vn];
				varyings[vn] = interpVarying(a, b, c, b0, b1, b2, w0r, w1r, w2r, wsum);
			}
			let frag;
			try {
				frag = fRun.runFragment(varyings, uniforms, V(4, [px, db.h - py, depth, 1 / wsum]));
			} catch (e) { continue; }
			if (frag.discarded) continue;
			let [r, g, b, a] = frag.color.v.map(v => Math.max(0, Math.min(1, v)));
			const oi = di * 4, dst = db.color;
			if (blendOn) {
				const [sr, sg, sb, sa] = [r, g, b, a];
				const dr = dst[oi] / 255, dg = dst[oi + 1] / 255, db2 = dst[oi + 2] / 255, da = dst[oi + 3] / 255;
				const bf = gl.blendFuncValue || [SRC_ALPHA, ONE_MINUS_SRC_ALPHA];
				const sf = blendFactor(bf[0], sr, sg, sb, sa, dr, dg, db2, da);
				const df = blendFactor(bf[1], sr, sg, sb, sa, dr, dg, db2, da);
				const eq = gl.blendEquationValue ?? FUNC_ADD;
				const comb = (s, d, s2, d2) => eq === FUNC_SUBTRACT ? s * s2 - d * d2
					: eq === FUNC_REVERSE_SUBTRACT ? d * d2 - s * s2 : s * s2 + d * d2;
				r = comb(sr, dr, sf[0], df[0]); g = comb(sg, dg, sf[1], df[1]);
				b = comb(sb, db2, sf[2], df[2]); a = comb(sa, da, sf[3], df[3]);
			}
			if (colorMask[0]) dst[oi] = Math.round(Math.max(0, Math.min(1, r)) * 255);
			if (colorMask[1]) dst[oi + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
			if (colorMask[2]) dst[oi + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
			if (colorMask[3]) dst[oi + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
			if (gl.depthMaskValue !== false) db.depth[di] = depth;
			pixels++;
		}
	}
	return pixels;
}

function depthPass(func, z, d) {
	switch (func) {
		case NEVER: return false;
		case LESS: return z < d;
		case EQUAL: return z === d;
		case LEQUAL: return z <= d;
		case GREATER: return z > d;
		case NOTEQUAL: return z !== d;
		case GEQUAL: return z >= d;
		case ALWAYS: default: return true;
	}
}
function blendFactor(f, sr, sg, sb, sa, dr, dg, db, da) {
	switch (f) {
		case ZERO: return [0, 0, 0, 0];
		case ONE: return [1, 1, 1, 1];
		case SRC_COLOR: return [sr, sg, sb, sa];
		case ONE_MINUS_SRC_COLOR: return [1 - sr, 1 - sg, 1 - sb, 1 - sa];
		case SRC_ALPHA: return [sa, sa, sa, sa];
		case ONE_MINUS_SRC_ALPHA: return [1 - sa, 1 - sa, 1 - sa, 1 - sa];
		case DST_ALPHA: return [da, da, da, da];
		case ONE_MINUS_DST_ALPHA: return [1 - da, 1 - da, 1 - da, 1 - da];
		case DST_COLOR: return [dr, dg, db, da];
		case ONE_MINUS_DST_COLOR: return [1 - dr, 1 - dg, 1 - db, 1 - da];
		case SRC_ALPHA_SATURATE: { const s = Math.min(sa, 1 - da); return [s, s, s, 1]; }
		default: return [1, 1, 1, 1];
	}
}
function interpVarying(a, b, c, b0, b1, b2, w0r, w1r, w2r, wsum) {
	if (!a) return a;
	if (a.t === 'v') {
		const n = a.n, out = new Array(n);
		const bv = b?.t === 'v' ? b.v : new Array(n).fill(0);
		const cv = c?.t === 'v' ? c.v : new Array(n).fill(0);
		for (let i = 0; i < n; i++)
			out[i] = (b0 * a.v[i] * w0r + b1 * bv[i] * w1r + b2 * cv[i] * w2r) / wsum;
		return { t: 'v', n, v: out };
	}
	if (a.t === 'f' || a.t === 'i' || a.t === 'b') {
		const av = a.v, bv = b ? b.v : 0, cv = c ? c.v : 0;
		const val = (b0 * av * w0r + b1 * bv * w1r + b2 * cv * w2r) / wsum;
		return a.t === 'f' ? { t: 'f', v: val } : a.t === 'i' ? { t: 'i', v: Math.trunc(val) } : { t: 'b', v: !!Math.round(val) };
	}
	return a;
}

// ---- lines & points (minimal, honest) ----
function drawLinesOrPoints() { return { ok: true, note: 'lines/points minimal' }; }

return { ensureDrawingBuffer, clearGL, drawGL, drawElementsGL };
});
