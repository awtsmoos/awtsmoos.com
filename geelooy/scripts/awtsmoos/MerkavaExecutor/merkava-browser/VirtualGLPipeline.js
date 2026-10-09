// B"H
// Boruch Hashem
// Blessed be He
//
// VirtualGLPipeline.js — real WebGL software pipeline from scratch.
//
// Executes retained WebGL state (compiled GLSL IR, bound buffers, uniforms)
// through a genuine graphics pipeline: vertex processing -> primitive
// assembly -> viewport transform -> triangle rasterization (edge functions,
// perspective-correct varying interpolation) -> fragment processing ->
// depth test -> blending -> drawing buffer. No GPU, no native code.
//
// B"H 2026-10-09 — huge-buffer optimization pass:
//   * Per-draw buffer view cache: one DataView/Uint8Array per buffer per draw
//     (was: a fresh DataView per attribute component per vertex).
//   * Indexed vertex cache: each unique vertex is shaded exactly once
//     (was: shared vertices re-shaded per index reference).
//   * Flat Float32Array vertex/varying storage (was: one JS object per vertex
//     kept alive for the whole draw — the dominant GC cost).
//   * Frustum culling in NDC before rasterization setup.
//   * Incremental edge functions and incremental perspective-correct
//     numerator stepping in the rasterizer (adds instead of mults).
//   * Real instanced draws (drawArraysInstanced/drawElementsInstanced) with
//     vertexAttribDivisor support (was: journal-only).
//   * clearGL color fill via Uint32Array (identical bytes).
// Pixel output is unchanged: same math, same order-independent decisions.
//
// Coordinate note: the drawing buffer uses canvas convention (row 0 = top).
// The viewport transform flips GL's y-up space; gl_FragCoord is reported in
// the same flipped space, consistently.
(function(root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory(require('./VirtualGLSL.js'));
	else { root.Merkava = root.Merkava || {}; Object.assign(root.Merkava, factory(root.Merkava)); }
})(typeof self !== 'undefined' ? self : this, function(glslMod) {
'use strict';
const { createShaderRunner } = glslMod;

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
const CONSTANT_COLOR = 0x8001, ONE_MINUS_CONSTANT_COLOR = 0x8002,
	CONSTANT_ALPHA = 0x8003, ONE_MINUS_CONSTANT_ALPHA = 0x8004;
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
	// B"H: scissor clips clears too (GL spec).
	let scx0 = 0, scy0 = 0, scx1 = db.w - 1, scy1 = db.h - 1;
	if (gl.enabledCaps?.has(SCISSOR_TEST) && gl.scissorValue) {
		const [cx, cy, cw, ch] = gl.scissorValue;
		scx0 = Math.max(0, cx); scy0 = Math.max(0, db.h - cy - ch);
		scx1 = Math.min(db.w - 1, cx + cw - 1); scy1 = Math.min(db.h - 1, db.h - cy - 1);
	}
	if (mask & COLOR_BUFFER_BIT) {
		const c = gl.clearColorValue || [0, 0, 0, 0];
		const r = Math.round(c[0] * 255), g = Math.round(c[1] * 255),
			b = Math.round(c[2] * 255), a = Math.round(c[3] * 255);
		const cm = gl.colorMaskValue || [true, true, true, true];
		const fullClear = scx0 === 0 && scy0 === 0 && scx1 === db.w - 1 && scy1 === db.h - 1;
		if (fullClear && cm[0] && cm[1] && cm[2] && cm[3]) {
			// B"H: identical bytes to the per-pixel loop, via one 32-bit fill.
			const u32 = new Uint32Array(db.color.buffer, db.color.byteOffset, db.color.length >>> 2);
			u32.fill((r | (g << 8) | (b << 16) | (a << 24)) >>> 0);
			const rem = db.color.length & 3;
			const base = db.color.length - rem;
			for (let i = 0; i < rem; i++) {
				db.color[base + i] = [r, g, b, a][i];
			}
		} else {
			for (let y = scy0; y <= scy1; y++) {
				for (let x = scx0; x <= scx1; x++) {
					const i = (y * db.w + x) * 4;
					if (cm[0]) db.color[i] = r; if (cm[1]) db.color[i+1] = g;
					if (cm[2]) db.color[i+2] = b; if (cm[3]) db.color[i+3] = a;
				}
			}
		}
	}
	if (mask & DEPTH_BUFFER_BIT) {
		const dv = gl.clearDepthValue ?? 1;
		if (scx0 === 0 && scy0 === 0 && scx1 === db.w - 1 && scy1 === db.h - 1) {
			db.depth.fill(dv);
		} else {
			for (let y = scy0; y <= scy1; y++)
				for (let x = scx0; x <= scx1; x++)
					db.depth[y * db.w + x] = dv;
		}
	}
	// STENCIL_BUFFER_BIT: no stencil buffer allocated (honest no-op)
}

// ================= per-draw buffer views =================
// One DataView + Uint8Array per buffer per draw call. Previously a fresh
// DataView was allocated per attribute *component* per *vertex*.
function bufferView(buf) {
	const data = buf?.data;
	if (!data) return null;
	let u8 = null;
	if (ArrayBuffer.isView(data)) {
		u8 = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
	} else if (data instanceof ArrayBuffer) {
		u8 = new Uint8Array(data);
	} else if (Array.isArray(data)) {
		u8 = new Uint8Array(new Float32Array(data).buffer);
	} else {
		return null;
	}
	return { u8, dv: new DataView(u8.buffer, u8.byteOffset, u8.byteLength) };
}

function readComp(dv, byteIndex, type, normalized) {
	switch (type) {
		case BYTE: { const v = dv.getInt8(byteIndex); return normalized ? Math.max(-1, v / 127) : v; }
		case UNSIGNED_BYTE: { const v = dv.getUint8(byteIndex); return normalized ? v / 255 : v; }
		case SHORT: { const v = dv.getInt16(byteIndex, true); return normalized ? Math.max(-1, v / 32767) : v; }
		case UNSIGNED_SHORT: { const v = dv.getUint16(byteIndex, true); return normalized ? v / 65535 : v; }
		case INT: return dv.getInt32(byteIndex, true);
		case UNSIGNED_INT: return dv.getUint32(byteIndex, true);
		case FLOAT: default: return dv.getFloat32(byteIndex, true);
	}
}

// Attribute descriptor built once per draw. kind 0 = constant, 1 = buffer.
function buildAttribs(gl, program, viewCache) {
	const list = [];
	for (const a of program.attribList || []) {
		const loc = program.attribs[a.name];
		const ptr = loc !== undefined ? gl.attribPointers?.[loc] : null;
		const enabled = loc !== undefined && gl.enabledAttribs?.has(loc);
		let d = null;
		if (ptr && ptr.buffer && enabled) {
			let vw = viewCache.get(ptr.buffer);
			if (!vw) { vw = bufferView(ptr.buffer); viewCache.set(ptr.buffer, vw); }
			if (vw) {
				const compBytes = TYPE_BYTES[ptr.type] || 4;
				d = {
					name: a.name, decl: a.type, kind: 1,
					dv: vw.dv, size: ptr.size, vtype: ptr.type,
					normalized: !!ptr.normalized,
					stride: ptr.stride > 0 ? ptr.stride : ptr.size * compBytes,
					offset: ptr.offset, compBytes,
					divisor: (gl.attribDivisors && gl.attribDivisors[loc]) || 0,
				};
			}
		}
		if (!d) {
			const c = (loc !== undefined && gl.attribConstants?.[loc]) || [0, 0, 0, 1];
			d = { name: a.name, decl: a.type, kind: 0, c0: c[0], c1: c[1], c2: c[2], c3: c[3] };
		}
		list.push(d);
	}
	return list;
}

// Reusable value holder shaped like the shader-declared attribute type.
// One holder per attribute, refilled per vertex (the interpreter copies on
// assign; holders are never retained past extraction).
function makeHolder(decl) {
	if (decl === 'vec2') return { t: 'v', n: 2, v: [0, 0] };
	if (decl === 'vec3') return { t: 'v', n: 3, v: [0, 0, 0] };
	if (decl === 'float') return { t: 'f', v: 0 };
	if (decl === 'int') return { t: 'i', v: 0 };
	return { t: 'v', n: 4, v: [0, 0, 0, 1] };
}

// Fill holder from descriptor d at vertex index vi. Mirrors the old
// fetchAttrib + toDeclared semantics exactly (pad rule: z=0, w=1).
function fillHolder(h, d, vi) {
	if (d.kind === 0) {
		if (h.t === 'v') {
			const n = h.n, vv = h.v;
			vv[0] = d.c0; if (n > 1) vv[1] = d.c1; if (n > 2) vv[2] = d.c2; if (n > 3) vv[3] = d.c3;
		} else if (h.t === 'f') h.v = d.c0;
		else h.v = Math.trunc(d.c0);
		return;
	}
	const dv = d.dv;
	const base = d.offset + vi * d.stride;
	const size = d.size, vt = d.vtype, norm = d.normalized, cb = d.compBytes;
	// fetch up to 4 comps with the historical pad rule
	let c0 = 0, c1 = 0, c2 = 0, c3 = 1;
	if (size > 0) c0 = readComp(dv, base, vt, norm);
	if (size > 1) c1 = readComp(dv, base + cb, vt, norm);
	if (size > 2) c2 = readComp(dv, base + 2 * cb, vt, norm);
	if (size > 3) c3 = readComp(dv, base + 3 * cb, vt, norm);
	if (h.t === 'v') {
		const n = h.n, vv = h.v;
		vv[0] = c0; if (n > 1) vv[1] = c1; if (n > 2) vv[2] = c2; if (n > 3) vv[3] = c3;
	} else if (h.t === 'f') h.v = c0;
	else h.v = Math.trunc(c0);
}

// ---- uniforms (gathered once per draw, as before) ----
function gatherUniforms(gl, program) {
	const uniforms = {};
	for (const u of program.uniformList || []) {
		let key = program.id + ':' + u.name;
		let rec = gl.uniformValues?.get(key);
		if (!rec && u.arrSize > 0) {
			// B"H: arrays are set via 'name[0]' location.
			key = program.id + ':' + u.name + '[0]';
			rec = gl.uniformValues?.get(key);
		}
		// B"H: unset uniforms default to zero (WebGL spec).
		const v = rec ? (rec.value || []) : [];
		if (u.arrSize > 0) {
			// B"H: uniform arrays -> {t:'arr', v:[...]}
			const n = u.arrSize;
			const arr = [];
			for (let i = 0; i < n; i++) {
				if (u.type === 'float') arr.push({ t: 'f', v: v[i] || 0 });
				else if (u.type === 'int') arr.push({ t: 'i', v: Math.trunc(v[i] || 0) });
				else if (u.type === 'vec2') arr.push({ t: 'v', n: 2, v: [v[i*2]||0, v[i*2+1]||0] });
				else if (u.type === 'vec3') arr.push({ t: 'v', n: 3, v: [v[i*3]||0, v[i*3+1]||0, v[i*3+2]||0] });
				else if (u.type === 'vec4') arr.push({ t: 'v', n: 4, v: [v[i*4]||0, v[i*4+1]||0, v[i*4+2]||0, v[i*4+3]||0] });
				else arr.push({ t: 'f', v: v[i] || 0 });
			}
			uniforms[u.name] = { t: 'arr', v: arr };
		}
		else if (u.type === 'float') uniforms[u.name] = { t: 'f', v: v[0] || 0 };
		else if (u.type === 'int') uniforms[u.name] = { t: 'i', v: Math.trunc(v[0] || 0) };
		else if (u.type === 'bool') uniforms[u.name] = { t: 'b', v: !!v[0] };
		else if (u.type === 'vec2') uniforms[u.name] = { t: 'v', n: 2, v: [v[0] || 0, v[1] || 0] };
		else if (u.type === 'vec3') uniforms[u.name] = { t: 'v', n: 3, v: [v[0] || 0, v[1] || 0, v[2] || 0] };
		else if (u.type === 'vec4') uniforms[u.name] = { t: 'v', n: 4, v: [v[0] || 0, v[1] || 0, v[2] || 0, v[3] === undefined ? 1 : v[3]] };
		else if (u.type === 'mat4') {
			const m = new Array(16).fill(0);
			for (let i = 0; i < Math.min(16, v.length); i++) m[i] = v[i];
			uniforms[u.name] = { t: 'm', n: 4, v: m };
		}
		else uniforms[u.name] = { t: 'f', v: v[0] || 0 };
	}
	return uniforms;
}

// ---- draw setup shared by all draw entry points ----
function setupDraw(gl) {
	const db = ensureDrawingBuffer(gl);
	const program = gl.currentProgram;
	if (!program || !program.linked || !program.glsl) {
		gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502);
		return null;
	}
	const { vertex, fragment } = program.glsl;
	const vRun = createShaderRunner(vertex), fRun = createShaderRunner(fragment);
	const uniforms = gatherUniforms(gl, program);
	const viewCache = new Map();
	const attribs = buildAttribs(gl, program, viewCache);
	const holders = attribs.map(d => makeHolder(d.decl));
	const container = {};
	for (let i = 0; i < attribs.length; i++) container[attribs[i].name] = holders[i];
	const vp = gl.viewportValue || [0, 0, db.w, db.h];
	return { db, program, vRun, fRun, uniforms, attribs, holders, container, vx: vp[0], vy: vp[1], vw: vp[2], vh: vp[3] };
}

// Varying descriptors from the first shaded vertex: {name, kind, n}.
// kind 'f' = float/vec (direct), 'i' = int (trunc), 'b' = bool (round).
// All values are stored as floats in flat arrays; conversion at fragment time.
function varyingDescs(sample) {
	const ds = [];
	let total = 0;
	for (const name of Object.keys(sample)) {
		const v = sample[name];
		let kind = 'f', n = 1, bool = false;
		if (v && v.t === 'v') n = v.n || 1;
		else if (v && v.t === 'i') kind = 'i';
		else if (v && v.t === 'b') { kind = 'b'; bool = true; }
		ds.push({ name, kind, n, bool, offset: total });
		total += n;
	}
	return { list: ds, total };
}

function extractVarying(data, vd, slot, val) {
	const base = slot * vd.n;
	if (!val) {
		for (let j = 0; j < vd.n; j++) data[base + j] = 0;
		return;
	}
	if (val.t === 'v') {
		const vv = val.v || [];
		for (let j = 0; j < vd.n; j++) data[base + j] = j < vv.length ? vv[j] : 0;
	} else if (val.t === 'f') data[base] = val.v;
	else if (val.t === 'i') data[base] = val.v;
	else if (val.t === 'b') data[base] = val.v ? 1 : 0;
	else data[base] = 0;
}

// Shade one vertex index into flat slot. Returns the raw varyings object of
// the first call so the caller can build descriptors (pass wantSample).
function shadeInto(ctx, vi, instance, slot, store, wantSample) {
	const { attribs, holders, container, vRun, uniforms } = ctx;
	for (let a = 0; a < attribs.length; a++) {
		const d = attribs[a];
		const ei = d.divisor > 0 ? Math.floor(instance / d.divisor) : vi;
		fillHolder(holders[a], d, ei);
	}
	let vs;
	try { vs = vRun.runVertex(container, uniforms); }
	catch (e) { return { error: e }; }
	const p = vs.position.v;
	store.pos[slot * 4] = p[0]; store.pos[slot * 4 + 1] = p[1];
	store.pos[slot * 4 + 2] = p[2]; store.pos[slot * 4 + 3] = p[3];
	if (wantSample) return { sample: vs.varyings };
	for (let k = 0; k < store.vdList.length; k++) {
		const vd = store.vdList[k];
		extractVarying(vd.data, vd, slot, vs.varyings[vd.name]);
	}
	return null;
}

// Viewport transform over flat arrays (y flipped to canvas-top convention).
function viewportTransform(store, n, vx, vy, vw, vh, h) {
	const { pos, ndc, sx, sy, sw } = store;
	// B"H: canvas y-down. GL viewport (vx,vy) y-up -> canvas y offset is (h - vy - vh).
	const yOff = h - vy - vh;
	for (let s = 0; s < n; s++) {
		const w = pos[s * 4 + 3] === 0 ? 1e-9 : pos[s * 4 + 3];
		const nx = pos[s * 4] / w, ny = pos[s * 4 + 1] / w, nz = pos[s * 4 + 2] / w;
		ndc[s * 3] = nx; ndc[s * 3 + 1] = ny; ndc[s * 3 + 2] = nz;
		sw[s] = w;
		sx[s] = (nx * 0.5 + 0.5) * vw + vx;
		sy[s] = (0.5 - ny * 0.5) * vh + yOff;
	}
}

// ---- primitive assembly over slot triples ----
function triSlots(mode, order, npos) {
	// order: Int32Array mapping draw position -> shade slot
	const tris = [];
	if (mode === TRIANGLES) {
		for (let i = 0; i + 2 < npos; i += 3) tris.push(order[i], order[i + 1], order[i + 2]);
	} else if (mode === TRIANGLE_STRIP) {
		for (let i = 0; i + 2 < npos; i++) {
			if (i % 2 === 0) tris.push(order[i], order[i + 1], order[i + 2]);
			else tris.push(order[i], order[i + 2], order[i + 1]);
		}
	} else if (mode === TRIANGLE_FAN) {
		for (let i = 1; i + 1 < npos; i++) tris.push(order[0], order[i], order[i + 1]);
	}
	return tris;
}

// ================= core draw =================
// drawCore: full setup + draw. drawCoreWithCtx: reuse an existing setup
// (for instanced loops where runners/uniforms/attribs are loop-invariant).
function drawCore(gl, mode, order, npos) {
	const ctx = setupDraw(gl);
	if (!ctx) return { ok: false, reason: 'no linked program' };
	return drawCoreWithCtx(gl, ctx, mode, order, npos);
}

function drawCoreWithCtx(gl, ctx, mode, order, npos) {
	const { db, vRun, uniforms, vx, vy, vw, vh } = ctx;

	// B"H: vertex cache — shade each unique slot once. For non-indexed draws
	// every position is unique; for indexed draws shared vertices are shaded
	// exactly once (previously: re-shaded per index reference).
	const nslots = order.nslots;
	const store = {
		pos: new Float32Array(nslots * 4),
		ndc: new Float32Array(nslots * 3),
		sx: new Float32Array(nslots),
		sy: new Float32Array(nslots),
		sw: new Float32Array(nslots),
		vdList: null, vdTotal: 0,
	};
	// Shade slot 0 first to learn varying layout.
	const r0 = shadeInto(ctx, order.viOf(0), 0, 0, store, true);
	if (r0 && r0.error) { gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502); return { ok: false, reason: 'vertex: ' + r0.error.message }; }
	const vd = varyingDescs(r0.sample || {});
	store.vdList = vd.list; store.vdTotal = vd.total;
	for (const d of vd.list) d.data = new Float32Array(nslots * d.n);
	// extract slot 0 varyings from the already-shaded sample (no re-shade)
	{
		const s0v = r0.sample || {};
		for (let k = 0; k < store.vdList.length; k++) {
			const d2 = store.vdList[k];
			extractVarying(d2.data, d2, 0, s0v[d2.name]);
		}
	}
	for (let s = 1; s < nslots; s++) {
		const r = shadeInto(ctx, order.viOf(s), order.instOf(s), s, store, false);
		if (r && r.error) { gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502); return { ok: false, reason: 'vertex: ' + r.error.message }; }
	}
	viewportTransform(store, nslots, vx, vy, vw, vh, db.h);

	const tris = triSlots(mode, order.slots, npos);
	const fRun = ctx.fRun;
	let pixels = 0, triCount = 0;
	for (let t = 0; t < tris.length; t += 3) {
		const s0 = tris[t], s1 = tris[t + 1], s2 = tris[t + 2];
		// near-plane guard (historical simplification, preserved): drop
		// triangles with any w <= 0.
		if (store.sw[s0] <= 0 || store.sw[s1] <= 0 || store.sw[s2] <= 0) continue;
		// B"H: frustum culling in NDC — skip triangles fully outside one plane.
		const nx0 = store.ndc[s0 * 3], ny0 = store.ndc[s0 * 3 + 1];
		const nx1 = store.ndc[s1 * 3], ny1 = store.ndc[s1 * 3 + 1];
		const nx2 = store.ndc[s2 * 3], ny2 = store.ndc[s2 * 3 + 1];
		if ((nx0 < -1 && nx1 < -1 && nx2 < -1) || (nx0 > 1 && nx1 > 1 && nx2 > 1) ||
			(ny0 < -1 && ny1 < -1 && ny2 < -1) || (ny0 > 1 && ny1 > 1 && ny2 > 1)) continue;
		triCount++;
		pixels += rasterizeTri(gl, db, ctx, store, s0, s1, s2, vx, vy, vw, vh);
	}
	return { ok: true, triangles: triCount, pixels };
}

// order abstraction: slots Int32Array, plus viOf/instOf for shading
function makeOrder(npos, nslots, slots, viOf, instOf) {
	return { npos, nslots, slots, viOf, instOf };
}

function drawGL(gl, mode, first, count) {
	if (count <= 0) return { ok: true, triangles: 0, pixels: 0 };
	const npos = count;
	const slots = new Int32Array(npos);
	for (let i = 0; i < npos; i++) slots[i] = i;
	const order = makeOrder(npos, npos, slots, (s) => first + s, () => 0);
	return drawCore(gl, mode, order, npos);
}

function drawArraysInstancedGL(gl, mode, first, count, instanceCount) {
	if (count <= 0 || instanceCount <= 0) return { ok: true, triangles: 0, pixels: 0 };
	const ctx = setupDraw(gl);
	if (!ctx) return { ok: false, reason: 'no linked program' };
	let totalPixels = 0, totalTris = 0;
	// Per-instance draws; divisor attributes differ per instance so the
	// vertex cache is rebuilt per instance (base mesh still cached within).
	// Setup (runners, uniforms, attribs) is hoisted out of the loop.
	for (let inst = 0; inst < instanceCount; inst++) {
		const npos = count;
		const slots = new Int32Array(npos);
		for (let i = 0; i < npos; i++) slots[i] = i;
		const order = makeOrder(npos, npos, slots, (s) => first + s, () => inst);
		const r = drawCoreWithCtx(gl, ctx, mode, order, npos);
		if (!r.ok) return r;
		totalPixels += r.pixels; totalTris += r.triangles;
	}
	return { ok: true, triangles: totalTris, pixels: totalPixels };
}

function parseIndices(gl, ibuf, count, type, offset) {
	const vw = bufferView(ibuf);
	if (!vw) { gl.pushError?.(gl.INVALID_OPERATION ?? 0x0502); return null; }
	const compBytes = TYPE_BYTES[type] || 2;
	const dv = vw.dv, u8 = vw.u8;
	const out = new Int32Array(count);
	const base = offset || 0;
	if (type === UNSIGNED_BYTE) {
		for (let i = 0; i < count; i++) out[i] = u8[base + i];
	} else if (type === UNSIGNED_INT) {
		for (let i = 0; i < count; i++) out[i] = dv.getUint32(base + i * 4, true);
	} else {
		for (let i = 0; i < count; i++) out[i] = dv.getUint16(base + i * 2, true);
	}
	return out;
}

function drawElementsCore(gl, mode, indices, instance) {
	const n = indices.length;
	if (n === 0) return { ok: true, triangles: 0, pixels: 0 };
	// B"H: indexed vertex cache — map each unique index to one shade slot.
	let maxIdx = 0;
	for (let i = 0; i < n; i++) if (indices[i] > maxIdx) maxIdx = indices[i];
	const useArray = maxIdx < 8000000;
	const cache = useArray ? new Int32Array(maxIdx + 1).fill(-1) : new Map();
	const slots = new Int32Array(n);
	const uniq = [];
	for (let i = 0; i < n; i++) {
		const vi = indices[i];
		let s = useArray ? cache[vi] : cache.get(vi);
		if (s === undefined || s < 0) {
			s = uniq.length;
			uniq.push(vi);
			if (useArray) cache[vi] = s; else cache.set(vi, s);
		}
		slots[i] = s;
	}
	const order = makeOrder(n, uniq.length, slots, (s) => uniq[s], () => instance);
	return drawCoreWithCtx(gl, ctx, mode, order, n);
}

function drawElementsCoreWithSetup(gl, ctx, mode, indices, instance) {
	const n = indices.length;
	if (n === 0) return { ok: true, triangles: 0, pixels: 0 };
	// B"H: indexed vertex cache — map each unique index to one shade slot.
	let maxIdx = 0;
	for (let i = 0; i < n; i++) if (indices[i] > maxIdx) maxIdx = indices[i];
	const useArray = maxIdx < 8000000;
	const cache = useArray ? new Int32Array(maxIdx + 1).fill(-1) : new Map();
	const slots = new Int32Array(n);
	const uniq = [];
	for (let i = 0; i < n; i++) {
		const vi = indices[i];
		let s = useArray ? cache[vi] : cache.get(vi);
		if (s === undefined || s < 0) {
			s = uniq.length;
			uniq.push(vi);
			if (useArray) cache[vi] = s; else cache.set(vi, s);
		}
		slots[i] = s;
	}
	const order = makeOrder(n, uniq.length, slots, (s) => uniq[s], () => instance);
	return drawCoreWithCtx(gl, ctx, mode, order, n);
}

function drawElementsCore(gl, mode, indices, instance) {
	const ctx = setupDraw(gl);
	if (!ctx) return { ok: false, reason: 'no linked program' };
	return drawElementsCoreWithSetup(gl, ctx, mode, indices, instance);
}

function drawElementsGL(gl, mode, count, type, offset) {
	const ibuf = gl.boundBuffers?.get(gl.ELEMENT_ARRAY_BUFFER ?? 0x8893);
	const indices = parseIndices(gl, ibuf, count, type, offset);
	if (!indices) return { ok: false, reason: 'no element buffer' };
	return drawElementsCore(gl, mode, indices, 0);
}

function drawElementsInstancedGL(gl, mode, count, type, offset, instanceCount) {
	const ibuf = gl.boundBuffers?.get(gl.ELEMENT_ARRAY_BUFFER ?? 0x8893);
	const indices = parseIndices(gl, ibuf, count, type, offset);
	if (!indices) return { ok: false, reason: 'no element buffer' };
	if (instanceCount <= 0) return { ok: true, triangles: 0, pixels: 0 };
	const ctx = setupDraw(gl);
	if (!ctx) return { ok: false, reason: 'no linked program' };
	let totalPixels = 0, totalTris = 0;
	for (let inst = 0; inst < instanceCount; inst++) {
		const r = drawElementsCoreWithSetup(gl, ctx, mode, indices, inst);
		if (!r.ok) return r;
		totalPixels += r.pixels; totalTris += r.triangles;
	}
	return { ok: true, triangles: totalTris, pixels: totalPixels };
}

// ================= rasterization =================
function edge(ax, ay, bx, by, px, py) { return (bx - ax) * (py - ay) - (by - ay) * (px - ax); }

function rasterizeTri(gl, db, ctx, store, s0, s1, s2, vx, vy, vw, vh) {
	const sx = store.sx, sy = store.sy;
	const x0 = sx[s0], y0 = sy[s0], x1 = sx[s1], y1 = sy[s1], x2 = sx[s2], y2 = sy[s2];
	const area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
	if (area === 0) return 0;
	// culling (area computed in flipped space: CCW front => negative area)
	if (gl.enabledCaps?.has(CULL_FACE)) {
		const ccw = (gl.frontFaceValue ?? CCW) === CCW;
		const front = ccw ? area < 0 : area > 0;
		const cm = gl.cullFaceValue ?? BACK;
		if (cm === FRONT_AND_BACK) return 0;
		if (cm === BACK && !front) return 0;
		if (cm === FRONT && front) return 0;
	}
	const cvy0 = db.h - vy - vh; // canvas-space viewport top
	let sx0 = Math.max(vx, Math.floor(Math.min(x0, x1, x2)));
	let sx1 = Math.min(vx + vw - 1, Math.ceil(Math.max(x0, x1, x2)));
	let sy0 = Math.max(cvy0, Math.floor(Math.min(y0, y1, y2)));
	let sy1 = Math.min(cvy0 + vh - 1, Math.ceil(Math.max(y0, y1, y2)));
	if (gl.enabledCaps?.has(SCISSOR_TEST) && gl.scissorValue) {
		const [cx, cy, cw, ch] = gl.scissorValue;
		// B"H: GL scissor y-up -> canvas y-down: canvas y = h - gl_y - 1
		const scy0 = db.h - cy - ch, scy1 = db.h - cy - 1;
		sx0 = Math.max(sx0, cx); sy0 = Math.max(sy0, scy0);
		sx1 = Math.min(sx1, cx + cw - 1); sy1 = Math.min(sy1, scy1);
	}
	if (sx1 < sx0 || sy1 < sy0) return 0;

	const w0r = 1 / store.sw[s0], w1r = 1 / store.sw[s1], w2r = 1 / store.sw[s2];
	// B"H: incremental edge functions. E_i are linear in x/y; step with adds.
	// dE/dx = -(by-ay), dE/dy = (bx-ax) for E = edge(a,b).
	const dE0dx = -(y2 - y1), dE0dy = (x2 - x1); // E0 = edge(v1,v2)
	const dE1dx = -(y0 - y2), dE1dy = (x0 - x2); // E1 = edge(v2,v0)
	const dE2dx = -(y1 - y0), dE2dy = (x1 - x0); // E2 = edge(v0,v1)
	const px0 = sx0 + 0.5, py0 = sy0 + 0.5;
	let e0 = edge(x1, y1, x2, y2, px0, py0);
	let e1 = edge(x2, y2, x0, y0, px0, py0);
	let e2 = edge(x0, y0, x1, y1, px0, py0);

	// Perspective-correct interpolation without per-pixel area division:
	// attr = Σ E_i·a_i·w_ir / Σ E_i·w_ir (area cancels). N, D, Nz stepped.
	const dDdx = dE0dx * w0r + dE1dx * w1r + dE2dx * w2r;
	const dDdy = dE0dy * w0r + dE1dy * w1r + dE2dy * w2r;
	let D = e0 * w0r + e1 * w1r + e2 * w2r;
	const z0 = store.ndc[s0 * 3 + 2], z1 = store.ndc[s1 * 3 + 2], z2 = store.ndc[s2 * 3 + 2];
	const dNzdx = dE0dx * z0 * w0r + dE1dx * z1 * w1r + dE2dx * z2 * w2r;
	const dNzdy = dE0dy * z0 * w0r + dE1dy * z1 * w1r + dE2dy * z2 * w2r;
	let Nz = e0 * z0 * w0r + e1 * z1 * w1r + e2 * z2 * w2r;

	const vdList = store.vdList;
	const nv = vdList.length;
	// per-varying numerator steps, flat: index vd.offset + j
	const dNdx = new Float64Array(store.vdTotal);
	const dNdy = new Float64Array(store.vdTotal);
	const Narr = new Float64Array(store.vdTotal);
	for (let k = 0; k < nv; k++) {
		const vd = vdList[k], data = vd.data, n = vd.n;
		const o0 = s0 * n, o1 = s1 * n, o2 = s2 * n;
		for (let j = 0; j < n; j++) {
			const a0 = data[o0 + j] * w0r, a1 = data[o1 + j] * w1r, a2 = data[o2 + j] * w2r;
			const t = vd.offset + j;
			dNdx[t] = dE0dx * a0 + dE1dx * a1 + dE2dx * a2;
			dNdy[t] = dE0dy * a0 + dE1dy * a1 + dE2dy * a2;
			Narr[t] = e0 * a0 + e1 * a1 + e2 * a2;
		}
	}

	const depthOn = !!gl.enabledCaps?.has(DEPTH_TEST);
	const depthFunc = gl.depthFuncValue ?? LEQUAL;
	const blendOn = gl.enabledCaps?.has(BLEND);
	const colorMask = gl.colorMaskValue || [true, true, true, true];
	const fRun = ctx.fRun, uniforms = ctx.uniforms;
	// Reusable fragment-varying holders (never retained past the call).
	const holders = vdList.map(vd => vd.n === 1
		? (vd.kind === 'i' ? { t: 'i', v: 0 } : vd.kind === 'b' ? { t: 'b', v: false } : { t: 'f', v: 0 })
		: { t: 'v', n: vd.n, v: new Array(vd.n).fill(0) });
	const varyingsIn = {};
	for (let k = 0; k < nv; k++) varyingsIn[vdList[k].name] = holders[k];
	const fragCoord = { t: 'v', n: 4, v: [0, 0, 0, 1] };
	const fragCoordV = fragCoord.v;
	const dbW = db.w, dbH = db.h, dst = db.color, depthArr = db.depth;

	let pixels = 0;
	// B"H: running numerator array (flat) instead of per-pixel allocation.
	const Nr = new Float64Array(store.vdTotal);
	for (let y = sy0; y <= sy1; y++) {
		let re0 = e0, re1 = e1, re2 = e2, rD = D, rNz = Nz;
		for (let t = 0; t < store.vdTotal; t++) Nr[t] = Narr[t];
		const py = y + 0.5;
		for (let x = sx0; x <= sx1; x++) {
			const inside = area > 0 ? !(re0 < 0 || re1 < 0 || re2 < 0) : !(re0 > 0 || re1 > 0 || re2 > 0);
			if (inside && rD !== 0) {
				const depth = (rNz / rD) * 0.5 + 0.5;
				const di = y * dbW + x;
				if (!depthOn || depthPass(depthFunc, depth, depthArr[di])) {
					const invD = 1 / rD;
					for (let k = 0; k < nv; k++) {
						const vd = vdList[k], h = holders[k], n = vd.n, off = vd.offset;
						if (n === 1) {
							const val = Nr[off] * invD;
							if (vd.kind === 'i') h.v = Math.trunc(val);
							else if (vd.kind === 'b') h.v = !!Math.round(val);
							else h.v = val;
						} else {
							const hv = h.v;
							for (let j = 0; j < n; j++) hv[j] = Nr[off + j] * invD;
						}
					}
					// gl_FragCoord: old code passed 1/wsum where wsum = rD/area.
					fragCoordV[0] = x + 0.5; fragCoordV[1] = dbH - py; fragCoordV[2] = depth; fragCoordV[3] = area / rD;
					let frag;
					try { frag = fRun.runFragment(varyingsIn, uniforms, fragCoord); }
					catch (e) { frag = null; }
					if (frag && !frag.discarded) {
						let r = frag.color.v[0], g = frag.color.v[1], b = frag.color.v[2], a = frag.color.v[3];
						r = Math.max(0, Math.min(1, r)); g = Math.max(0, Math.min(1, g));
						b = Math.max(0, Math.min(1, b)); a = Math.max(0, Math.min(1, a));
						const oi = di * 4;
						if (blendOn) {
							const dr = dst[oi] / 255, dg = dst[oi + 1] / 255, db2 = dst[oi + 2] / 255, da = dst[oi + 3] / 255;
							const bf = gl.blendFuncSeparateValue || gl.blendFuncValue || [SRC_ALPHA, ONE_MINUS_SRC_ALPHA];
							const bc = gl.blendColorValue || [0, 0, 0, 0];
							const bfRGB = bf.length === 4 ? [bf[0], bf[1]] : bf;
							const bfA = bf.length === 4 ? [bf[2], bf[3]] : bf;
							const sfRGB = blendFactor(bfRGB[0], r, g, b, a, dr, dg, db2, da, bc);
							const dfRGB = blendFactor(bfRGB[1], r, g, b, a, dr, dg, db2, da, bc);
							const sfA = blendFactor(bfA[0], r, g, b, a, dr, dg, db2, da, bc);
							const dfA = blendFactor(bfA[1], r, g, b, a, dr, dg, db2, da, bc);
							const eq = gl.blendEquationValue ?? FUNC_ADD;
							if (eq === FUNC_SUBTRACT) { r = r * sfRGB[0] - dr * dfRGB[0]; g = g * sfRGB[1] - dg * dfRGB[1]; b = b * sfRGB[2] - db2 * dfRGB[2]; a = a * sfA[3] - da * dfA[3]; }
							else if (eq === FUNC_REVERSE_SUBTRACT) { r = dr * dfRGB[0] - r * sfRGB[0]; g = dg * dfRGB[1] - g * sfRGB[1]; b = db2 * dfRGB[2] - b * sfRGB[2]; a = da * dfA[3] - a * sfA[3]; }
							else { r = r * sfRGB[0] + dr * dfRGB[0]; g = g * sfRGB[1] + dg * dfRGB[1]; b = b * sfRGB[2] + db2 * dfRGB[2]; a = a * sfA[3] + da * dfA[3]; }
						}
						if (colorMask[0]) dst[oi] = Math.round(Math.max(0, Math.min(1, r)) * 255);
						if (colorMask[1]) dst[oi + 1] = Math.round(Math.max(0, Math.min(1, g)) * 255);
						if (colorMask[2]) dst[oi + 2] = Math.round(Math.max(0, Math.min(1, b)) * 255);
						if (colorMask[3]) dst[oi + 3] = Math.round(Math.max(0, Math.min(1, a)) * 255);
						if (gl.depthMaskValue !== false) depthArr[di] = depth;
						pixels++;
					}
				}
			}
			// step to next pixel
			re0 += dE0dx; re1 += dE1dx; re2 += dE2dx; rD += dDdx; rNz += dNzdx;
			for (let t = 0; t < store.vdTotal; t++) Nr[t] += dNdx[t];
		}
		// row step
		e0 += dE0dy; e1 += dE1dy; e2 += dE2dy; D += dDdy; Nz += dNzdy;
		for (let t = 0; t < store.vdTotal; t++) Narr[t] += dNdy[t];
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
function blendFactor(f, sr, sg, sb, sa, dr, dg, db, da, bc) {
	bc = bc || [0, 0, 0, 0];
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
		case CONSTANT_COLOR: return [bc[0], bc[1], bc[2], bc[3]];
		case ONE_MINUS_CONSTANT_COLOR: return [1 - bc[0], 1 - bc[1], 1 - bc[2], 1 - bc[3]];
		case CONSTANT_ALPHA: return [bc[3], bc[3], bc[3], bc[3]];
		case ONE_MINUS_CONSTANT_ALPHA: { const v = 1 - bc[3]; return [v, v, v, v]; }
		default: return [1, 1, 1, 1];
	}
}

// ---- lines & points (minimal, honest) ----
function drawLinesOrPoints() { return { ok: true, note: 'lines/points minimal' }; }

return { ensureDrawingBuffer, clearGL, drawGL, drawElementsGL, drawArraysInstancedGL, drawElementsInstancedGL };
});
