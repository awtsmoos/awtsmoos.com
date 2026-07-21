// B"H // Boruch Hashem // Blessed is He

/**
 * @file VillageCottageEnvelopeGeometry.test.mjs
 * @description Proves the canonical cottage envelope is convex-faced, recessed, finite, and renderable.
 * The Awtsmoos joins separate stones into one shelter without confusing unity with flat sameness;
 * Awtsmoos.com tests that the threshold enters inward while the foundation embraces the slope.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrimitiveMesh } from '../../world/Box3D.js';
import {
	createEnvelopeGeometry,
	createVillageCottageEnvelope
} from '../../world/village/VillageCottageEnvelopeGeometry.js';
import { TEXTURE } from './SurfaceGeometryTestFixtures.mjs';

const OPTIONS = {
	base: 4,
	depth: 8,
	detail: 'near',
	id: 'H10',
	wallHeight: 6,
	wallRepeat: [2, 2],
	width: 10,
	x: 3,
	yaw: 0,
	z: 7
};

test('cottage envelope preserves one convex-faced authored mesh', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	assert.equal(geometry.vertices.length, 56);
	assert.equal(geometry.faces.length, 37);
	assert.equal(geometry.foundationHeight, 0.9);
	assert.equal(geometry.recessDepth, 0.56);
	assert.deepEqual(geometry.entranceOpening, { height: 2.25, width: 1.72 });
	for (const face of geometry.faces) {
		assert.ok(face.length >= 4);
		assert.equal(new Set(face).size, face.length);
		assert.ok(isConvexFace(face.map(index => geometry.vertices[index])));
	}
});

test('recessed entrance has no blocking face inside the doorway bounds', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	const recessedZ = OPTIONS.z + OPTIONS.depth / 2 - 0.1 - geometry.recessDepth;
	const openingBottom = OPTIONS.base + geometry.foundationHeight;
	const openingTop = openingBottom + geometry.entranceOpening.height;
	const blocked = geometry.faces.some(face => {
		const points = face.map(index => geometry.vertices[index]);
		if (!points.every(([, , z]) => Math.abs(z - recessedZ) < 0.001)) return false;
		const xs = points.map(([x]) => x);
		const ys = points.map(([, y]) => y);
		return Math.min(...xs) < OPTIONS.x + geometry.entranceOpening.width / 2
			&& Math.max(...xs) > OPTIONS.x - geometry.entranceOpening.width / 2
			&& Math.min(...ys) < openingTop
			&& Math.max(...ys) > openingBottom;
	});
	assert.equal(blocked, false);
});

test('cottage foundation is wider and its entrance visibly recedes', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	const foundation = geometry.vertices.filter(([, y]) => y === OPTIONS.base);
	const wallTop = geometry.vertices.filter(([, y]) => y === OPTIONS.base + OPTIONS.wallHeight);
	const foundationWidth = Math.max(...foundation.map(([x]) => Math.abs(x - OPTIONS.x)));
	const wallWidth = Math.max(...wallTop.map(([x]) => Math.abs(x - OPTIONS.x)));
	const frontDepths = new Set(wallTop.map(([, , z]) => Number(z.toFixed(2))));
	assert.ok(foundationWidth > wallWidth);
	assert.ok(frontDepths.has(10.9));
	assert.ok(frontDepths.has(10.34));
});

test('manual envelope reaches the renderer with finite native geometry', () => {
	const definition = createVillageCottageEnvelope(
		OPTIONS,
		{
			anisotropy: 8,
			mixStone: TEXTURE,
			stone: TEXTURE,
			texturePolicy: { tileWorld: 2 }
		},
		{ canonicalId: 'H10', family: 'test-cottage-envelope' }
	);
	const mesh = createPrimitiveMesh(definition);
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.solid, true);
	assert.equal(definition.userData.recessDepth, 0.56);
	assert.ok(mesh.geometry.attributes.position.array.length > 0);
	assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
	assert.ok([...mesh.geometry.attributes.normal.array].every(Number.isFinite));
	assert.ok([...mesh.geometry.attributes.uv.array].every(Number.isFinite));
});

function isConvexFace(points) {
	const normal = newellNormal(points);
	let direction = 0;
	for (let index = 0; index < points.length; index += 1) {
		const previous = points[(index + points.length - 1) % points.length];
		const current = points[index];
		const next = points[(index + 1) % points.length];
		const sign = Math.sign(dot(cross(subtract(current, previous), subtract(next, current)), normal));
		if (!sign) continue;
		if (!direction) direction = sign;
		if (sign !== direction) return false;
	}
	return direction !== 0;
}

function newellNormal(points) {
	return points.reduce((normal, point, index) => {
		const next = points[(index + 1) % points.length];
		return [
			normal[0] + (point[1] - next[1]) * (point[2] + next[2]),
			normal[1] + (point[2] - next[2]) * (point[0] + next[0]),
			normal[2] + (point[0] - next[0]) * (point[1] + next[1])
		];
	}, [0, 0, 0]);
}

function subtract(left, right) {
	return left.map((value, index) => value - right[index]);
}

function cross(left, right) {
	return [
		left[1] * right[2] - left[2] * right[1],
		left[2] * right[0] - left[0] * right[2],
		left[0] * right[1] - left[1] * right[0]
	];
}

function dot(left, right) {
	return left.reduce((total, value, index) => total + value * right[index], 0);
}
