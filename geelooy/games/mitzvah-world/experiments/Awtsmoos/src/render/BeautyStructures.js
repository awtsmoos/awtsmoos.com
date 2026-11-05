// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyStructures.js
 * @description Crafted procedural geometry for MitzvahWorld's five buildable structures:
 * sukkah, fence, lantern, bench, and well. Nothing boxy-by-accident: tapered posts,
 * woven wall slats, schach laths with leafy inlay, pointed picket caps, glass lantern
 * panes under a peaked cap, slatted benches with backrests, and coursed stone wells
 * with pitched shingle roofs, rope, and bucket.
 *
 * Builders are pure: they fill preallocated arrays (no incremental growth) and return
 * frozen geometry vessels {positions, normals, colors, indices, triangleCount}.
 * Builds happen at placement time, never per frame. Triangle budgets are enforced and
 * exported for tests.
 */

import { beautyClamp } from './BeautyRng.js';

/** Hard triangle budgets per structure. */
export const BEAUTY_STRUCTURE_BUDGETS = Object.freeze({
	sukkah: 1400,
	fence: 500,
	lantern: 600,
	bench: 500,
	well: 1800
});

/** Wood, stone, leaf, and glass material colors (linear-ish 0..1). */
const WOOD_DARK = [0.30, 0.20, 0.12];
const WOOD_MID = [0.48, 0.34, 0.20];
const WOOD_LIGHT = [0.60, 0.45, 0.28];
const WOOD_PALE = [0.68, 0.53, 0.34];
const STONE = [0.52, 0.50, 0.46];
const STONE_DARK = [0.38, 0.37, 0.34];
const LEAF = [0.30, 0.48, 0.18];
const LEAF_DARK = [0.22, 0.38, 0.14];
const GLASS_WARM = [1.30, 1.05, 0.62];
const WATER_DARK = [0.10, 0.22, 0.28];
const ROPE = [0.55, 0.46, 0.32];
const ROOF_SHINGLE = [0.42, 0.28, 0.16];

class BeautyMesh {
	constructor(maxVerts, maxIndices) {
		this.positions = new Float32Array(maxVerts * 3);
		this.normals = new Float32Array(maxVerts * 3);
		this.colors = new Float32Array(maxVerts * 3);
		this.indices = new Uint32Array(maxIndices);
		this.vertCount = 0;
		this.indexCount = 0;
		this.partSeed = 1;
	}

	grain(base) {
		// Deterministic per-vertex tint: material reads as grain, not flat paint.
		let h = (this.vertCount * 0x9e3779b1) ^ (this.partSeed * 0x85ebca6b);
		h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0;
		const f = 0.90 + (h / 4294967296) * 0.20;
		return [base[0] * f, base[1] * f, base[2] * f];
	}

	quad(a, b, c, d, normal, color) {
		const base = this.vertCount;
		const pts = [a, b, c, d];
		for (const p of pts) {
			const o = this.vertCount * 3;
			this.positions[o] = p[0];
			this.positions[o + 1] = p[1];
			this.positions[o + 2] = p[2];
			this.normals[o] = normal[0];
			this.normals[o + 1] = normal[1];
			this.normals[o + 2] = normal[2];
			const tint = this.grain(color);
			this.colors[o] = tint[0];
			this.colors[o + 1] = tint[1];
			this.colors[o + 2] = tint[2];
			this.vertCount++;
		}
		const idx = this.indexCount;
		this.indices[idx] = base;
		this.indices[idx + 1] = base + 1;
		this.indices[idx + 2] = base + 2;
		this.indices[idx + 3] = base;
		this.indices[idx + 4] = base + 2;
		this.indices[idx + 5] = base + 3;
		this.indexCount += 6;
	}

	tri(a, b, c, normal, color) {
		const base = this.vertCount;
		for (const p of [a, b, c]) {
			const o = this.vertCount * 3;
			this.positions[o] = p[0];
			this.positions[o + 1] = p[1];
			this.positions[o + 2] = p[2];
			this.normals[o] = normal[0];
			this.normals[o + 1] = normal[1];
			this.normals[o + 2] = normal[2];
			const tint = this.grain(color);
			this.colors[o] = tint[0];
			this.colors[o + 1] = tint[1];
			this.colors[o + 2] = tint[2];
			this.vertCount++;
		}
		this.indices[this.indexCount++] = base;
		this.indices[this.indexCount++] = base + 1;
		this.indices[this.indexCount++] = base + 2;
	}

	/**
	 * Oriented box. Rotation is [yaw, pitch, roll] in radians.
	 * taper scales the top face (0.8 = gently narrower crown).
	 */
	box(cx, cy, cz, sx, sy, sz, rotation, color, taper = 1) {
		const [yaw = 0, pitch = 0, roll = 0] = rotation || [];
		const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
		const cp = Math.cos(pitch), sp = Math.sin(pitch);
		const cr = Math.cos(roll), sr = Math.sin(roll);
		const rot = (x, y, z) => {
			// Roll (Z), then pitch (X), then yaw (Y).
			let x1 = x * cr - y * sr, y1 = x * sr + y * cr, z1 = z;
			let y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp, x2 = x1;
			let x3 = x2 * cyaw + z2 * syaw, z3 = -x2 * syaw + z2 * cyaw, y3 = y2;
			return [cx + x3, cy + y3, cz + z3];
		};
		const rotN = (x, y, z) => {
			let x1 = x * cr - y * sr, y1 = x * sr + y * cr, z1 = z;
			let y2 = y1 * cp - z1 * sp, z2 = y1 * sp + z1 * cp, x2 = x1;
			return [x2 * cyaw + z2 * syaw, y2, -x2 * syaw + z2 * cyaw];
		};
		const hx = sx / 2, hy = sy / 2, hz = sz / 2;
		const tx = hx * taper, tz = hz * taper;
		// 8 corners: bottom (full) then top (tapered).
		const c = [
			rot(-hx, -hy, -hz), rot(hx, -hy, -hz), rot(hx, -hy, hz), rot(-hx, -hy, hz),
			rot(-tx, hy, -tz), rot(tx, hy, -tz), rot(tx, hy, tz), rot(-tx, hy, tz)
		];
		const faces = [
			[[0, 1, 2, 3], rotN(0, -1, 0)],
			[[5, 4, 7, 6], rotN(0, 1, 0)],
			[[4, 5, 1, 0], rotN(0, 0, -1)],
			[[6, 7, 3, 2], rotN(0, 0, 1)],
			[[7, 4, 0, 3], rotN(-1, 0, 0)],
			[[5, 6, 2, 1], rotN(1, 0, 0)]
		];
		this.partSeed++;
		for (const [corners, n] of faces) {
			this.quad(c[corners[0]], c[corners[1]], c[corners[2]], c[corners[3]], n, color);
		}
	}

	/** N-sided tapered prism (posts, axle, finial). */
	prism(cx, cy, cz, radiusBottom, radiusTop, height, sides, yaw, color) {
		this.partSeed++;
		const step = (Math.PI * 2) / sides;
		const y0 = cy - height / 2, y1 = cy + height / 2;
		const ring = (r, y) => {
			const pts = [];
			for (let i = 0; i < sides; i++) {
				const a = yaw + i * step;
				pts.push([cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]);
			}
			return pts;
		};
		const lower = ring(radiusBottom, y0);
		const upper = ring(radiusTop, y1);
		for (let i = 0; i < sides; i++) {
			const j = (i + 1) % sides;
			const a = yaw + (i + 0.5) * step;
			const n = [Math.cos(a), 0, Math.sin(a)];
			// Ring order is clockwise-from-above, so the side quad must list
			// corners counter-clockwise (j before i) to match the outward normal.
			this.quad(lower[j], lower[i], upper[i], upper[j], n, color);
		}
		// Cap the top.
		const center = [cx, y1, cz];
		for (let i = 0; i < sides; i++) {
			const j = (i + 1) % sides;
			this.tri(center, upper[j], upper[i], [0, 1, 0], color);
		}
	}

	/** N-sided pyramid cap (picket points, lantern roofs). apex at (cx, cy + h, cz). */
	pyramid(cx, cy, cz, radius, height, sides, yaw, color) {
		this.partSeed++;
		const apex = [cx, cy + height, cz];
		const step = (Math.PI * 2) / sides;
		for (let i = 0; i < sides; i++) {
			const a0 = yaw + i * step;
			const a1 = yaw + (i + 1) * step;
			const p0 = [cx + Math.cos(a0) * radius, cy, cz + Math.sin(a0) * radius];
			const p1 = [cx + Math.cos(a1) * radius, cy, cz + Math.sin(a1) * radius];
			const mid = (a0 + a1) / 2;
			const slope = radius / Math.max(height, 1e-4);
			const inv = 1 / Math.sqrt(1 + slope * slope);
			const n = [Math.cos(mid) * inv, slope * inv, Math.sin(mid) * inv];
			// p0 sits at the lower angle: list p1 first so the winding
			// faces outward-up along n.
			this.tri(p1, p0, apex, n, color);
		}
	}

	/** Flat N-gon disc fan (well water surface). */
	disc(cx, cy, cz, radius, sides, color) {
		this.partSeed++;
		const center = [cx, cy, cz];
		const step = (Math.PI * 2) / sides;
		for (let i = 0; i < sides; i++) {
			const a0 = i * step;
			const a1 = (i + 1) * step;
			this.tri(
				center,
				[cx + Math.cos(a1) * radius, cy, cz + Math.sin(a1) * radius],
				[cx + Math.cos(a0) * radius, cy, cz + Math.sin(a0) * radius],
				[0, 1, 0], color
			);
		}
	}

	finish(id) {
		return Object.freeze({
			id,
			positions: this.positions.subarray(0, this.vertCount * 3),
			normals: this.normals.subarray(0, this.vertCount * 3),
			colors: this.colors.subarray(0, this.vertCount * 3),
			indices: this.indices.subarray(0, this.indexCount),
			vertexCount: this.vertCount,
			triangleCount: this.indexCount / 3
		});
	}
}

/** Sukkah: tapered corner posts, woven slat walls on three sides, schach beam roof with leafy inlay, dark trim rails, entry step. */
export function buildSukkah() {
	const mesh = new BeautyMesh(4096, 12288);
	const half = 1.55;
	const postH = 2.6;
	// Corner posts with gentle taper and a darker foot.
	for (const [px, pz] of [[-half, -half], [half, -half], [half, half], [-half, half]]) {
		mesh.box(px, postH / 2, pz, 0.22, postH, 0.22, [0, 0, 0], WOOD_DARK, 0.82);
		mesh.box(px, 0.12, pz, 0.30, 0.24, 0.30, [0, 0, 0], STONE_DARK);
	}
	// Walls: back + two sides (front stays open). Rails + woven vertical slats.
	const wallH = 1.9;
	const wallY = 0.35 + wallH / 2;
	const walls = [
		{ from: [-half, -half], to: [half, -half] },
		{ from: [-half, -half], to: [-half, half] },
		{ from: [half, -half], to: [half, half] }
	];
	for (const wall of walls) {
		const [x0, z0] = wall.from;
		const [x1, z1] = wall.to;
		const dx = x1 - x0, dz = z1 - z0;
		const len = Math.sqrt(dx * dx + dz * dz);
		const yaw = Math.atan2(dx, dz);
		const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
		// Top and bottom rails (dark trim).
		mesh.box(mx, 0.35, mz, 0.10, 0.12, len, [yaw, 0, 0], WOOD_DARK);
		mesh.box(mx, 0.35 + wallH, mz, 0.12, 0.14, len, [yaw, 0, 0], WOOD_DARK);
		// Woven slats with breathing gaps.
		const slats = Math.floor(len / 0.22);
		for (let s = 0; s < slats; s++) {
			const t = (s + 0.5) / slats;
			const lean = (s % 2 === 0 ? 1 : -1) * 0.035;
			mesh.box(
				x0 + dx * t, wallY, z0 + dz * t,
				0.13, wallH, 0.05, [yaw + lean, 0, lean * 0.6],
				s % 3 === 0 ? WOOD_MID : WOOD_LIGHT
			);
		}
	}
	// Schach: main beams across, then thinner laths with gaps, leafy inlay strips.
	const roofY = postH + 0.06;
	const beams = 9;
	for (let b = 0; b < beams; b++) {
		const t = (b + 0.5) / beams;
		mesh.box(-half + t * half * 2, roofY, 0, 0.10, 0.12, half * 2 + 0.5, [0, 0, 0], WOOD_MID);
	}
	const laths = 16;
	for (let l = 0; l < laths; l++) {
		const t = (l + 0.5) / laths;
		const z = -half + t * half * 2;
		mesh.box(0, roofY + 0.10, z, half * 2 + 0.5, 0.05, 0.09, [0, 0, (l % 2 ? 0.02 : -0.02)], WOOD_PALE);
		if (l % 3 === 0) {
			mesh.box(0, roofY + 0.16, z + 0.05, half * 2 + 0.3, 0.04, 0.12, [0, 0, 0.03], l % 6 === 0 ? LEAF : LEAF_DARK);
		}
	}
	// Cap rails on the roof edge (trim) + entry step stone.
	mesh.box(0, roofY + 0.02, -half - 0.22, half * 2 + 0.6, 0.10, 0.12, [0, 0, 0], WOOD_DARK);
	mesh.box(0, roofY + 0.02, half + 0.22, half * 2 + 0.6, 0.10, 0.12, [0, 0, 0], WOOD_DARK);
	mesh.box(0, 0.09, half + 0.75, 1.1, 0.18, 0.55, [0, 0, 0], STONE);
	return mesh.finish('sukkah');
}

/** Fence: pointed picket posts, two rustic rails with slight tilt, per-plank tint. */
export function buildFence(length = 4.8) {
	const mesh = new BeautyMesh(1024, 3072);
	const posts = 4;
	for (let p = 0; p < posts; p++) {
		const t = p / (posts - 1);
		const x = -length / 2 + t * length;
		mesh.box(x, 0.55, 0, 0.18, 1.1, 0.18, [0, 0, (p % 2 ? 0.015 : -0.015)], WOOD_MID, 0.9);
		mesh.pyramid(x, 1.08, 0, 0.155, 0.22, 4, Math.PI / 4, WOOD_DARK);
	}
	// Two rails, gently tilted for a hand-built feel.
	mesh.box(0, 0.88, 0, length, 0.10, 0.07, [0, 0, 0.012], WOOD_LIGHT);
	mesh.box(0, 0.42, 0, length, 0.10, 0.07, [0, 0, -0.010], WOOD_MID);
	return mesh.finish('fence');
}

/** Lantern: flared stone base, tapered post, warm glass panes in a dark frame, peaked cap, finial. */
export function buildLantern() {
	const mesh = new BeautyMesh(1024, 4096);
	mesh.box(0, 0.14, 0, 0.42, 0.28, 0.42, [0, 0, 0], STONE_DARK, 1.25);
	mesh.box(0, 1.05, 0, 0.16, 1.9, 0.16, [0, 0, 0], WOOD_DARK, 0.85);
	// Collar rings.
	mesh.box(0, 0.42, 0, 0.24, 0.08, 0.24, [0, 0, 0], WOOD_MID);
	mesh.box(0, 1.72, 0, 0.24, 0.08, 0.24, [0, 0, 0], WOOD_MID);
	// Glass chamber: 4 corner mullions + top/bottom frame + 4 warm panes.
	const gy = 2.05, gs = 0.30;
	for (const [mx, mz] of [[-gs / 2, -gs / 2], [gs / 2, -gs / 2], [gs / 2, gs / 2], [-gs / 2, gs / 2]]) {
		mesh.box(mx, gy, mz, 0.05, 0.52, 0.05, [0, 0, 0], WOOD_DARK);
	}
	mesh.box(0, gy - 0.27, 0, gs + 0.08, 0.07, gs + 0.08, [0, 0, 0], WOOD_DARK);
	mesh.box(0, gy + 0.27, 0, gs + 0.08, 0.07, gs + 0.08, [0, 0, 0], WOOD_DARK);
	// Glass panes: corner order is reversed (b before a) so each quad's
	// counter-clockwise winding faces along its supplied outward normal.
	mesh.quad([ gs/2, gy-0.24, -gs/2], [-gs/2, gy-0.24, -gs/2], [-gs/2, gy+0.24, -gs/2], [gs/2, gy+0.24, -gs/2], [0,0,-1], GLASS_WARM);
	mesh.quad([ -gs/2, gy-0.24, gs/2], [gs/2, gy-0.24, gs/2], [gs/2, gy+0.24, gs/2], [-gs/2, gy+0.24, gs/2], [0,0,1], GLASS_WARM);
	mesh.quad([ -gs/2, gy-0.24, -gs/2], [-gs/2, gy-0.24, gs/2], [-gs/2, gy+0.24, gs/2], [-gs/2, gy+0.24, -gs/2], [-1,0,0], GLASS_WARM);
	mesh.quad([ gs/2, gy-0.24, gs/2], [gs/2, gy-0.24, -gs/2], [gs/2, gy+0.24, -gs/2], [gs/2, gy+0.24, gs/2], [1,0,0], GLASS_WARM);
	// Peaked cap + finial ball.
	mesh.pyramid(0, gy + 0.34, 0, 0.34, 0.30, 4, Math.PI / 4, WOOD_DARK);
	mesh.prism(0, gy + 0.72, 0, 0.045, 0.045, 0.12, 8, 0, WOOD_MID);
	mesh.box(0, gy + 0.82, 0, 0.09, 0.09, 0.09, [0, 0, 0], WOOD_MID);
	return mesh.finish('lantern');
}

/** Bench: three seat slats with gaps, framed legs, slatted backrest with trim rail. */
export function buildBench(length = 1.9) {
	const mesh = new BeautyMesh(1024, 3072);
	const seatY = 0.46;
	// Seat slats with breathing gaps and alternating tint.
	for (let s = 0; s < 3; s++) {
		const z = -0.19 + s * 0.19;
		mesh.box(0, seatY, z, length, 0.07, 0.16, [0, 0, s === 1 ? 0.004 : -0.004], s % 2 ? WOOD_LIGHT : WOOD_PALE);
	}
	// Leg frames: two legs + crossbar each.
	for (const x of [-length / 2 + 0.22, length / 2 - 0.22]) {
		mesh.box(x, seatY / 2 - 0.02, -0.16, 0.12, seatY, 0.12, [0, 0, 0], WOOD_DARK, 0.85);
		mesh.box(x, seatY / 2 - 0.02, 0.16, 0.12, seatY, 0.12, [0, 0, 0], WOOD_DARK, 0.85);
		mesh.box(x, 0.14, 0, 0.10, 0.08, 0.44, [0, 0, 0], WOOD_MID);
	}
	// Backrest: posts, two slats, top trim rail with a slight backward lean.
	const backTilt = -0.10;
	for (const x of [-length / 2 + 0.18, length / 2 - 0.18]) {
		mesh.box(x, seatY + 0.42, -0.30, 0.10, 0.95, 0.10, [0, backTilt, 0], WOOD_DARK, 0.9);
	}
	mesh.box(0, seatY + 0.62, -0.345, length - 0.1, 0.13, 0.05, [0, backTilt, 0], WOOD_LIGHT);
	mesh.box(0, seatY + 0.34, -0.318, length - 0.1, 0.13, 0.05, [0, backTilt, 0], WOOD_MID);
	mesh.box(0, seatY + 0.92, -0.375, length, 0.09, 0.12, [0, backTilt, 0], WOOD_DARK);
	return mesh.finish('bench');
}

/** Well: three coursed stone rings with varied tint, dark water, posts, shingled pitched roof, axle, rope, bucket. */
export function buildWell() {
	const mesh = new BeautyMesh(2048, 8192);
	const radius = 1.05;
	const courses = 3;
	const perCourse = 12;
	for (let c = 0; c < courses; c++) {
		const y = 0.22 + c * 0.34;
		for (let s = 0; s < perCourse; s++) {
			const a = (s / perCourse) * Math.PI * 2 + c * 0.26;
			const x = Math.cos(a) * radius;
			const z = Math.sin(a) * radius;
			const yaw = -a + Math.PI / 2;
			const tint = (s + c) % 3 === 0 ? STONE_DARK : STONE;
			mesh.box(x, y, z, 0.52, 0.32, 0.30, [yaw + (s % 2 ? 0.03 : -0.03), 0, 0], tint);
		}
	}
	// Coping ring (cap stones) + dark water surface.
	for (let s = 0; s < perCourse; s++) {
		const a = (s / perCourse) * Math.PI * 2 + 0.13;
		mesh.box(Math.cos(a) * radius, 1.30, Math.sin(a) * radius, 0.56, 0.14, 0.36, [-a + Math.PI / 2, 0, 0], STONE_DARK);
	}
	mesh.disc(0, 0.95, 0, radius * 0.86, 12, WATER_DARK);
	// Posts, pitched shingle roof, ridge beam.
	const postH = 1.5;
	for (const x of [-radius - 0.12, radius + 0.12]) {
		mesh.box(x, 1.37 + postH / 2, 0, 0.16, postH, 0.16, [0, 0, 0], WOOD_DARK, 0.88);
	}
	const roofY = 1.37 + postH + 0.32;
	const slope = 0.62;
	for (const side of [-1, 1]) {
		mesh.box(side * 0.62, roofY, 0, 1.55, 0.08, 2.0, [0, side * slope, 0], WOOD_MID);
		// Shingle rows stepping down each slope.
		for (let r = 0; r < 4; r++) {
			const t = (r + 0.5) / 4;
			mesh.box(side * (0.06 + t * 1.12), roofY - t * 0.62 + 0.06, 0, 0.30, 0.05, 1.9, [0, side * slope, 0], ROOF_SHINGLE);
		}
	}
	mesh.box(0, roofY + 0.10, 0, 0.14, 0.14, 2.05, [0, 0, 0], WOOD_DARK);
	// Axle, rope, bucket.
	mesh.prism(0, 1.37 + postH - 0.25, 0, 0.07, 0.07, radius * 2 + 0.5, 8, 0, WOOD_MID);
	mesh.box(0.3, 1.37 + postH - 0.75, 0, 0.035, 1.0, 0.035, [0, 0, 0], ROPE);
	mesh.box(0.3, 1.30, 0, 0.30, 0.34, 0.30, [0, 0, 0], WOOD_MID, 0.82);
	mesh.box(0.3, 1.49, 0, 0.34, 0.05, 0.34, [0, 0, 0], WOOD_DARK);
	return mesh.finish('well');
}

/** Builds one structure by id; throws on unknown ids. */
export function buildStructure(structureId) {
	switch (structureId) {
		case 'sukkah': return buildSukkah();
		case 'fence': return buildFence();
		case 'lantern': return buildLantern();
		case 'bench': return buildBench();
		case 'well': return buildWell();
		default: throw new Error(`Unknown structure: ${structureId}`);
	}
}

/** Builds all five structures; returns a frozen map id -> geometry vessel. */
export function buildAllStructures() {
	return Object.freeze({
		sukkah: buildSukkah(),
		fence: buildFence(),
		lantern: buildLantern(),
		bench: buildBench(),
		well: buildWell()
	});
}

/** Triangle budget for one structure id (throws on unknown ids). */
export function structureTriangleBudget(structureId) {
	const budget = BEAUTY_STRUCTURE_BUDGETS[structureId];
	if (budget === undefined) throw new Error(`Unknown structure: ${structureId}`);
	return budget;
}
