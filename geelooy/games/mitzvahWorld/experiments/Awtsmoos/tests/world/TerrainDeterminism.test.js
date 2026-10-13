//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TerrainDeterminism.test.js
 * @description Proves the canonical valley is deterministic: identical inputs
 * produce byte-identical geometry, and the cooperative path matches the
 * synchronous path exactly. The Awtsmoos renews the valley each instant from
 * one truth; Awtsmoos.com requires that truth to be reproducible.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
	canonicalTerrainHeightAt,
	canonicalRoadAdjustedHeightAt,
	canonicalTerrainZoneAt
} from '../../src/world/CanonicalTerrainHeight.js';
import {
	createTerrainGeometry,
	createTerrainGeometryAsync,
	terrainCoordinateAt
} from '../../src/world/TerrainGeometry.js';
import { buildTerrainIndices } from '../../src/world/TerrainGeometryIndices.js';
import { canonicalTerraceSample, canonicalTerraceDefinitions } from '../../src/world/CanonicalTerrainTerraces.js';
import { canonicalRiverTerrainSample, canonicalRiverElevation } from '../../src/world/CanonicalTerrainHydrology.js';
import { terrainStepsForQuality } from '../../src/world/TerrainQualitySteps.js';
import { createTerrainBootPolicy } from '../../src/world/TerrainBootPolicy.js';
import { gridSurfaceNormals } from '../../src/world/SurfaceNormalField.js';

const STEPS = 32;
const SIZE = 540;

function geometryDigest(geometry) {
	const hash = createHash('sha256');
	hash.update(JSON.stringify(geometry.vertices.map(point => [point.x, point.y, point.z])));
	hash.update(JSON.stringify(geometry.indices));
	hash.update(JSON.stringify(geometry.normals));
	hash.update(JSON.stringify(geometry.uvs));
	hash.update(JSON.stringify(geometry.zones));
	return hash.digest('hex');
}

test('canonicalTerrainHeightAt is a pure function of coordinates', () => {
	const samples = [[0, 0], [-35, 45], [124, -42], [4, -148], [200, 150], [-260, 260]];
	for (const [x, z] of samples) {
		const first = canonicalTerrainHeightAt(x, z);
		const second = canonicalTerrainHeightAt(x, z);
		assert.equal(first, second, `height at (${x}, ${z}) must be stable`);
		assert.ok(Number.isFinite(first), `height at (${x}, ${z}) must be finite`);
	}
});

test('full terrain build is byte-identical across runs (same seed, same bytes)', () => {
	const first = createTerrainGeometry(SIZE, STEPS);
	const second = createTerrainGeometry(SIZE, STEPS);
	assert.equal(geometryDigest(first), geometryDigest(second), 'two builds must hash identically');
	assert.equal(first.vertices.length, second.vertices.length);
	assert.equal(first.colliders.length, (STEPS * STEPS * 2), 'expected two triangles per grid cell');
});

test('cooperative async build matches the synchronous build exactly', async () => {
	const sync = createTerrainGeometry(SIZE, STEPS);
	const async = await createTerrainGeometryAsync(SIZE, STEPS, {
		yieldEvery: 64,
		yieldWork: () => Promise.resolve()
	});
	assert.equal(geometryDigest(sync), geometryDigest(async), 'sync and async paths must agree byte-for-byte');
	assert.equal(async.preparation.yields > 0, true, 'the async path must actually yield');
	assert.equal(async.preparation.mode, 'cooperative');
});

test('terrain indices are valid, complete, and up-facing', () => {
	const indices = buildTerrainIndices(STEPS);
	assert.equal(indices.length, STEPS * STEPS * 6);
	const vertexCount = (STEPS + 1) * (STEPS + 1);
	for (const index of indices) {
		assert.ok(index >= 0 && index < vertexCount, `index ${index} out of range`);
	}
	const geometry = createTerrainGeometry(SIZE, STEPS);
	// No degenerate triangles: every face has nonzero area and an up-facing normal.
	for (const collider of geometry.colliders) {
		assert.ok(collider.solid && collider.floor && collider.kind === 'terrain');
		assert.ok(collider.normal.y > 0.3, 'terrain triangles must face upward');
	}
});

test('terrain normals are unit length and NaN-free', () => {
	const geometry = createTerrainGeometry(SIZE, STEPS);
	assert.equal(geometry.normals.length, geometry.vertices.length * 3);
	for (let i = 0; i < geometry.normals.length; i += 3) {
		const length = Math.hypot(geometry.normals[i], geometry.normals[i + 1], geometry.normals[i + 2]);
		assert.ok(Math.abs(length - 1) < 1e-9, `normal ${i / 3} not unit: ${length}`);
	}
});

test('terrainCoordinateAt maps the grid onto [-half, half] monotonically', () => {
	const half = SIZE / 2;
	assert.equal(terrainCoordinateAt(0, STEPS, half), -half);
	assert.equal(terrainCoordinateAt(STEPS, STEPS, half), half);
	assert.ok(Math.abs(terrainCoordinateAt(STEPS / 2, STEPS, half)) < half);
	let previous = -Infinity;
	for (let i = 0; i <= STEPS; i += 1) {
		const value = terrainCoordinateAt(i, STEPS, half);
		assert.ok(value > previous, 'grid coordinate must be strictly increasing');
		previous = value;
	}
});

test('river sample carries finite center, width, and bounded progress', () => {
	for (const [x, z] of [[0, 0], [-35, 45], [100, -100]]) {
		const river = canonicalRiverTerrainSample(x, z);
		assert.ok(Number.isFinite(river.distance) && river.distance >= 0);
		assert.ok(Number.isFinite(river.width) && river.width > 0);
		assert.ok(river.t >= 0 && river.t <= 1);
		assert.ok(Number.isFinite(river.center.x) && Number.isFinite(river.center.z));
	}
	const elevation = canonicalRiverElevation(0.5);
	assert.ok(Number.isFinite(elevation), 'river elevation is finite mid-course');
	assert.ok(canonicalRiverElevation(0) > canonicalRiverElevation(1), 'water descends downstream');
});

test('zone classification is stable and covers known districts', () => {
	const zones = new Set();
	for (let x = -260; x <= 260; x += 20) {
		for (let z = -260; z <= 260; z += 20) {
			zones.add(canonicalTerrainZoneAt(x, z));
		}
	}
	assert.ok(zones.has('grass-valley'), 'valley floor exists');
	assert.ok(zones.has('alpine-rock'), 'alpine rock exists');
	assert.ok(zones.has('stream-channel'), 'river channel exists');
	for (const zone of zones) {
		assert.ok(
			['stream-channel', 'river-bank', 'village-terrace', 'alpine-rock', 'grass-valley'].includes(zone),
			`unknown zone ${zone}`
		);
	}
});

test('terrace definitions are stable and bounded', () => {
	const first = canonicalTerraceDefinitions();
	const second = canonicalTerraceDefinitions();
	assert.equal(first, second, 'definitions are a shared frozen constant');
	assert.ok(first.length > 0);
	const sample = canonicalTerraceSample(-35, 45);
	assert.ok(sample.influence >= 0 && sample.influence <= 1);
	assert.ok(Number.isFinite(sample.targetHeight));
});

test('road-adjusted height never contradicts base terrain continuity', () => {
	for (const [x, z] of [[-12, 14], [-35, 45], [52, -42]]) {
		const base = canonicalTerrainHeightAt(x, z);
		const adjusted = canonicalRoadAdjustedHeightAt(x, z);
		assert.ok(Number.isFinite(adjusted));
		assert.ok(Math.abs(adjusted - base) < 40, 'road grading is a bounded local correction');
	}
});

test('terrain quality policy returns sane movement/refinement steps', () => {
	assert.equal(terrainStepsForQuality('ultra'), 88);
	assert.equal(terrainStepsForQuality('high'), 80);
	assert.equal(terrainStepsForQuality('low'), 48);
	assert.equal(terrainStepsForQuality('medium'), 64);
	assert.equal(terrainStepsForQuality('unknown-quality'), 64, 'unknown quality falls back to medium');
	const policy = createTerrainBootPolicy();
	assert.ok(policy.movementSteps <= policy.refinementSteps);
	const custom = createTerrainBootPolicy({ movementSteps: 40, refinementSteps: 40 });
	assert.deepEqual({ ...custom }, { movementSteps: 40, refinementSteps: 40 });
});

test('gridSurfaceNormals agrees with the analytic up direction on flat ground', () => {
	const vertices = [];
	for (let row = 0; row < 3; row += 1) {
		for (let col = 0; col < 3; col += 1) vertices.push([col, 0, row]);
	}
	const normals = gridSurfaceNormals(vertices, 3);
	assert.equal(normals.length, 9);
	for (const normal of normals) {
		assert.ok(Math.abs(normal[1] - 1) < 1e-12, `flat normal must be up, got ${normal}`);
	}
});

test('terrain evidence carries valley fingerprints', () => {
	const geometry = createTerrainGeometry(SIZE, STEPS);
	assert.equal(geometry.AwtsmoosTerrainValley.grid, `${STEPS}x${STEPS}`);
	assert.equal(geometry.AwtsmoosTerrainValley.colliderTriangles, STEPS * STEPS * 2);
	assert.ok(geometry.AwtsmoosTerrainValley.centerSpacing > 0);
	assert.ok(Array.isArray(geometry.AwtsmoosTerrainValley.terraces));
});
