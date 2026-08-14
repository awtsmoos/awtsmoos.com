// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageEnvelopeGeometry.test.mjs
 * @description Proves one floor datum governs recessed walls while retaining stone descends beneath it.
 * The Awtsmoos joins shelter and hill without lifting the doorway atop an accidental stone pedestal;
 * Awtsmoos.com tests that floor zero, wall zero, doorway zero, and foundation top remain one covenant still.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createPrimitiveMesh } from '../../world/Box3D.js';
import {
	createEnvelopeGeometry,
	createVillageCottageEnvelope
} from '../../world/village/VillageCottageEnvelopeGeometry.js';
import {
	geometryValuesClose,
	horizontalSpan,
	isConvexFace,
	minimumY,
	verticesAtY
} from './VillageCottageEnvelopeTestGeometry.mjs';
import { TEXTURE } from './SurfaceGeometryTestFixtures.mjs';

const OPTIONS = Object.freeze({
	base: 4,
	depth: 8,
	detail: 'near',
	id: 'H10',
	storyHeight: 3.08,
	wallHeight: 6,
	wallRepeat: [2, 2],
	width: 10,
	x: 3,
	yaw: 0,
	z: 7
});

const EXPECTED_DOOR_HEIGHT = OPTIONS.storyHeight * 0.73;

test('cottage envelope remains convex-faced with descending foundation', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	assert.equal(geometry.vertices.length, 56);
	assert.equal(geometry.faces.length, 37);
	assert.equal(geometry.foundationHeight, 0.9);
	assert.equal(geometry.recessDepth, 0.56);
	assert.ok(geometryValuesClose(
		geometry.entranceOpening.height,
		EXPECTED_DOOR_HEIGHT
	));
	assert.equal(geometry.entranceOpening.width, 1.72);
	assert.ok(geometryValuesClose(
		minimumY(geometry.vertices),
		OPTIONS.base - geometry.foundationHeight
	));
	for (const face of geometry.faces) {
		assert.ok(face.length >= 4);
		assert.equal(new Set(face).size, face.length);
		assert.ok(isConvexFace(face.map(index => geometry.vertices[index])));
	}
});

test('recessed entrance begins at the shared finished-floor datum', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	const recessedZ = OPTIONS.z
		+ OPTIONS.depth / 2
		- 0.1
		- geometry.recessDepth;
	const openingTop = OPTIONS.base + geometry.entranceOpening.height;
	const blocked = geometry.faces.some(face => {
		const points = face.map(index => geometry.vertices[index]);
		if (!points.every(([, , z]) => Math.abs(z - recessedZ) < 0.001)) {
			return false;
		}
		const xs = points.map(([x]) => x);
		const ys = points.map(([, y]) => y);
		return Math.min(...xs) < OPTIONS.x + geometry.entranceOpening.width / 2
			&& Math.max(...xs) > OPTIONS.x - geometry.entranceOpening.width / 2
			&& Math.min(...ys) < openingTop
			&& Math.max(...ys) > OPTIONS.base;
	});
	assert.equal(blocked, false);
});

test('foundation is wider at floor zero while front wall remains recessed', () => {
	const geometry = createEnvelopeGeometry(OPTIONS);
	const floor = verticesAtY(geometry.vertices, OPTIONS.base);
	const wallTop = verticesAtY(
		geometry.vertices,
		OPTIONS.base + OPTIONS.wallHeight
	);
	assert.ok(horizontalSpan(floor, OPTIONS.x) > horizontalSpan(wallTop, OPTIONS.x));
	const frontDepths = new Set(wallTop.map(([, , z]) => Number(z.toFixed(2))));
	assert.ok(frontDepths.has(10.9));
	assert.ok(frontDepths.has(10.34));
});

test('manual envelope reaches renderer with finite native geometry', () => {
	const definition = createVillageCottageEnvelope(OPTIONS, {
		anisotropy: 8,
		mixStone: TEXTURE,
		stone: TEXTURE,
		texturePolicy: { tileWorld: 2 }
	}, {
		canonicalId: 'H10',
		family: 'test-cottage-envelope'
	});
	const mesh = createPrimitiveMesh(definition);
	assert.equal(definition.shape, 'manual');
	assert.equal(definition.solid, true);
	assert.equal(definition.userData.recessDepth, 0.56);
	assert.ok([...mesh.geometry.attributes.position.array].every(Number.isFinite));
	assert.ok([...mesh.geometry.attributes.normal.array].every(Number.isFinite));
	assert.ok([...mesh.geometry.attributes.uv.array].every(Number.isFinite));
});
