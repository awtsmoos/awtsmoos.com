// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-shadow-cull.test.mjs
 * @description Proves the shadow caster cull keeps every vessel that can deposit
 * depth and skips only the ones a parallel sun could never paint into the map.
 * The decisive property cross-checks the cull basis against the real
 * computeShadowMatrix: any point the matrix places inside the frustum must
 * survive the cull, and any point the cull keeps must land inside the frustum
 * expanded by exactly the documented pad.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createShadowCullContext,
	shadowCasterMayCast
} from '../tiny-render-shadow-cull.js';
import { computeShadowMatrix } from '../tiny-shadow-map.js';

const RADIUS = 60;
const FOCUS = { x: 0, y: 0, z: 0 };
const SUN = [-0.62, 0.55, 0.44];

function pointGeometry() {
	return {
		mode: 4,
		attributes: {
			position: { array: new Float32Array([0, 0, 0]), itemSize: 3, count: 1 }
		},
		index: null
	};
}

function ballGeometry(radius) {
	const spread = radius / Math.sqrt(3);
	const corners = [];
	for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
		corners.push(sx * spread, sy * spread, sz * spread);
	}
	return {
		mode: 4,
		attributes: {
			position: {
				array: new Float32Array(corners),
				itemSize: 3,
				count: corners.length / 3
			}
		},
		index: null
	};
}

function meshAt(x, y, z, geometry, extra = {}) {
	const matrixWorld = new Float32Array(16);
	matrixWorld[0] = 1;
	matrixWorld[5] = 1;
	matrixWorld[10] = 1;
	matrixWorld[12] = x;
	matrixWorld[13] = y;
	matrixWorld[14] = z;
	matrixWorld[15] = 1;
	return {
		isMesh: true,
		geometry,
		matrixWorld,
		userData: {},
		...extra
	};
}

function seededRandom(seed) {
	let state = seed >>> 0;
	return () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

test('B"H casters at the focus cast, distant casters provably cannot', () => {
	const context = createShadowCullContext(SUN, FOCUS, RADIUS);
	assert.equal(shadowCasterMayCast(meshAt(0, 0, 0, ballGeometry(2)), context), true);
	assert.equal(shadowCasterMayCast(meshAt(30, 0, -20, ballGeometry(3)), context), true);
	assert.equal(shadowCasterMayCast(meshAt(400, 0, 0, ballGeometry(2)), context), false);
	assert.equal(shadowCasterMayCast(meshAt(0, 0, -500, ballGeometry(2)), context), false);
	assert.equal(shadowCasterMayCast(meshAt(-350, 120, 260, ballGeometry(4)), context), false);
});

test('B"H a large sphere reaching into the frustum still casts', () => {
	const context = createShadowCullContext(SUN, FOCUS, RADIUS);
	// Center far outside the box, radius large enough to overlap it.
	assert.equal(shadowCasterMayCast(meshAt(160, 0, 0, ballGeometry(140)), context), true);
	// Same center: the box surface sits ~37 world units away in light space,
	// so a radius-30 sphere cannot reach it while radius-40 barely can.
	assert.equal(shadowCasterMayCast(meshAt(160, 0, 0, ballGeometry(30)), context), false);
});

test('B"H skinned, instanced, variant, and boundless casters are never culled', () => {
	const context = createShadowCullContext(SUN, FOCUS, RADIUS);
	const far = [900, 0, 0];
	assert.equal(shadowCasterMayCast(
		meshAt(...far, ballGeometry(2), { isSkinnedMesh: true, skeleton: {} }),
		context
	), true);
	assert.equal(shadowCasterMayCast(
		meshAt(...far, ballGeometry(2), {
			userData: { instanced: { count: 4, matrices: new Float32Array(64), revision: 1 } }
		}),
		context
	), true);
	assert.equal(shadowCasterMayCast(
		meshAt(...far, ballGeometry(2), {
			userData: { instancedVariants: [{ geometry: ballGeometry(1), userData: {} }] }
		}),
		context
	), true);
	assert.equal(shadowCasterMayCast(
		meshAt(...far, null),
		context
	), true);
	assert.equal(shadowCasterMayCast(meshAt(...far, ballGeometry(2)), null), true);
});

test('B"H vertical sun keeps a finite basis and truthful verdicts', () => {
	const context = createShadowCullContext([0, 1, 0], FOCUS, RADIUS);
	for (const value of Object.values(context)) {
		assert.ok(Number.isFinite(value), 'context stays finite');
	}
	assert.equal(shadowCasterMayCast(meshAt(0, 0, 0, ballGeometry(2)), context), true);
	assert.equal(shadowCasterMayCast(meshAt(300, 0, 0, ballGeometry(2)), context), false);
});

test('B"H cull verdicts agree with the real shadow matrix on random points', () => {
	const context = createShadowCullContext(SUN, FOCUS, RADIUS);
	const matrix = computeShadowMatrix(SUN, FOCUS, RADIUS, new Float32Array(16));
	const random = seededRandom(613);
	const padNdc = 0.05 / RADIUS + 1e-4;
	let inside = 0;
	let outside = 0;
	for (let index = 0; index < 4000; index += 1) {
		const point = [
			(random() - 0.5) * 700,
			(random() - 0.5) * 300,
			(random() - 0.5) * 700
		];
		const clipX = matrix[0] * point[0] + matrix[4] * point[1] + matrix[8] * point[2] + matrix[12];
		const clipY = matrix[1] * point[0] + matrix[5] * point[1] + matrix[9] * point[2] + matrix[13];
		const clipZ = matrix[2] * point[0] + matrix[6] * point[1] + matrix[10] * point[2] + matrix[14];
		const clipW = matrix[3] * point[0] + matrix[7] * point[1] + matrix[11] * point[2] + matrix[15];
		const ndc = [clipX / clipW, clipY / clipW, clipZ / clipW];
		const mayCast = shadowCasterMayCast(
			meshAt(point[0], point[1], point[2], pointGeometry()),
			context
		);
		const strictlyInside = Math.abs(ndc[0]) < 1 - 1e-6
			&& Math.abs(ndc[1]) < 1 - 1e-6
			&& ndc[2] > -1 + 1e-6
			&& ndc[2] < 1 - 1e-6;
		if (strictlyInside) {
			inside += 1;
			assert.equal(mayCast, true, `inside point culled: ${point} ndc ${ndc}`);
		}
		const beyondPad = Math.abs(ndc[0]) > 1 + padNdc
			|| Math.abs(ndc[1]) > 1 + padNdc
			|| ndc[2] > 1 + padNdc * 3
			|| ndc[2] < -1 - padNdc * 3;
		if (beyondPad) {
			outside += 1;
			assert.equal(mayCast, false, `outside point kept: ${point} ndc ${ndc}`);
		}
	}
	assert.ok(inside > 50, `property sample too thin inside: ${inside}`);
	assert.ok(outside > 500, `property sample too thin outside: ${outside}`);
});
