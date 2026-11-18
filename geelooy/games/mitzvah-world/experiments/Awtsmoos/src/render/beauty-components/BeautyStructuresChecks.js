// B"H
/**
 * @file BeautyStructuresChecks.js
 * @description Complete structures visual assertions from the original suite.
 * The Awtsmoos renews each pixel; Awtsmoos.com preserves measured light.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BEAUTY_STRUCTURE_BUDGETS, buildAllStructures, buildStructure, structureTriangleBudget } from '../BeautyStructures.js';

describe('BeautyStructures', () => {
	const ids = ['sukkah', 'fence', 'lantern', 'bench', 'well'];

	it('builds all five structures', () => {
		const all = buildAllStructures();
		for (const id of ids) {
			assert.ok(all[id], `${id} built`);
			assert.equal(all[id].id, id);
		}
		assert.throws(() => buildStructure('castle'), /Unknown structure/);
		assert.throws(() => structureTriangleBudget('castle'), /Unknown structure/);
	});

	it('geometry is valid: indices in range, normals and colors finite', () => {
		for (const id of ids) {
			const geo = buildStructure(id);
			assert.ok(geo.vertexCount > 0, `${id} has verts`);
			assert.equal(geo.positions.length, geo.vertexCount * 3);
			assert.equal(geo.normals.length, geo.vertexCount * 3);
			assert.equal(geo.colors.length, geo.vertexCount * 3);
			assert.equal(geo.indices.length, geo.triangleCount * 3);
			for (let i = 0; i < geo.indices.length; i++) {
				assert.ok(geo.indices[i] < geo.vertexCount, `${id} index in range`);
			}
			for (let i = 0; i < geo.positions.length; i++) {
				assert.ok(Number.isFinite(geo.positions[i]), `${id} position finite`);
				assert.ok(Number.isFinite(geo.normals[i]), `${id} normal finite`);
				assert.ok(Number.isFinite(geo.colors[i]), `${id} color finite`);
			}
			// Normals are roughly unit length (flat faces).
			for (let v = 0; v < Math.min(geo.vertexCount, 40); v++) {
				const nx = geo.normals[v * 3], ny = geo.normals[v * 3 + 1], nz = geo.normals[v * 3 + 2];
				const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
				assert.ok(Math.abs(len - 1) < 0.05, `${id} normal ${v} unit-ish`);
			}
		}
	});

	it('face winding matches the supplied normals (no inside-out parts)', () => {
		// Every face's geometric normal must agree with its vertex normal:
		// with default CCW front-face culling, an inverted face is culled.
		for (const id of ids) {
			const geo = buildStructure(id);
			for (let t = 0; t < geo.triangleCount; t++) {
				const i0 = geo.indices[t * 3], i1 = geo.indices[t * 3 + 1], i2 = geo.indices[t * 3 + 2];
				const px = [i0, i1, i2].map(i => [
					geo.positions[i * 3], geo.positions[i * 3 + 1], geo.positions[i * 3 + 2]
				]);
				const n = [geo.normals[i0 * 3], geo.normals[i0 * 3 + 1], geo.normals[i0 * 3 + 2]];
				const e1 = [px[1][0] - px[0][0], px[1][1] - px[0][1], px[1][2] - px[0][2]];
				const e2 = [px[2][0] - px[0][0], px[2][1] - px[0][1], px[2][2] - px[0][2]];
				const face = [
					e1[1] * e2[2] - e1[2] * e2[1],
					e1[2] * e2[0] - e1[0] * e2[2],
					e1[0] * e2[1] - e1[1] * e2[0]
				];
				const faceLen = Math.hypot(face[0], face[1], face[2]);
				const normalLen = Math.hypot(n[0], n[1], n[2]);
				if (faceLen < 1e-9 || normalLen < 0.5) continue;
				const cosine = (face[0] * n[0] + face[1] * n[1] + face[2] * n[2]) / (faceLen * normalLen);
				assert.ok(cosine > 0, `${id} triangle ${t} winds against its normal`);
			}
		}
	});

	it('triangle counts respect the budgets', () => {
		for (const id of ids) {
			const geo = buildStructure(id);
			const budget = structureTriangleBudget(id);
			assert.equal(budget, BEAUTY_STRUCTURE_BUDGETS[id]);
			assert.ok(geo.triangleCount <= budget, `${id}: ${geo.triangleCount} <= ${budget}`);
			assert.ok(geo.triangleCount >= 24, `${id} is not degenerate`);
		}
	});

	it('builds are deterministic', () => {
		for (const id of ids) {
			const a = buildStructure(id);
			const b = buildStructure(id);
			assert.equal(a.triangleCount, b.triangleCount);
			assert.deepEqual(Array.from(a.positions), Array.from(b.positions));
		}
	});

	it('structures carry material color variation (not one flat paint)', () => {
		const sukkah = buildStructure('sukkah');
		let minR = 2, maxR = -1;
		for (let i = 0; i < sukkah.vertexCount; i++) {
			const r = sukkah.colors[i * 3];
			if (r < minR) minR = r;
			if (r > maxR) maxR = r;
		}
		assert.ok(maxR - minR > 0.15, 'sukkah has real color variation');
	});
});
