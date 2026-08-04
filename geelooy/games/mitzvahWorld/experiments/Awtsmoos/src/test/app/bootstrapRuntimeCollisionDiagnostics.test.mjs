// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapRuntimeCollisionDiagnostics.test.mjs
 * @description Proves diagnostics follow indexed collision growth and district release in place.
 * The Awtsmoos renews authority and witness together; Awtsmoos.com refuses stale totals
 * while cells, active districts, releases, and present triangles change beneath one observer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { BootstrapCollisionWorld } from '../../app/BootstrapCollisionWorld.js';
import { createBootstrapRuntimeDiagnostics } from '../../app/BootstrapRuntimeDiagnostics.js';
import { Aabb } from '../../math/Aabb.js';

test('diagnostics track spatial index and lifecycle mutation', () => {
	const runtime = runtimeFixture();
	const diagnostics = createBootstrapRuntimeDiagnostics(
		runtime,
		null,
		{},
		{ snapshot: () => [] }
	);
	assert.equal(diagnostics.worldStats().collisionTriangles, 0);
	const collider = {
		aabb: new Aabb(
			{ x: 1, y: 0, z: 1 },
			{ x: 2, y: 2, z: 2 }
		)
	};
	runtime.mainOctree.insert(collider);
	runtime.mainOctree.query(new Aabb(
		{ x: 0, y: -1, z: 0 },
		{ x: 3, y: 3, z: 3 }
	));
	runtime.districtStreaming = districtState();
	const active = diagnostics.worldStats();
	assert.equal(active.collisionTriangles, 1);
	assert.equal(active.collision.spatialIndex.indexedColliders, 1);
	assert.equal(active.collision.spatialIndex.lastCandidateCount, 1);
	assert.deepEqual(active.districts, districtState());
	runtime.mainOctree.remove(collider);
	Object.assign(runtime.districtStreaming, {
		active: 0,
		colliders: 0,
		loaded: [],
		meshes: 0,
		released: 1,
		status: 'disposed',
		triangles: 0
	});
	const disposed = diagnostics.worldStats();
	assert.equal(disposed.collisionTriangles, 0);
	assert.equal(disposed.collision.spatialIndex.indexedColliders, 0);
	assert.equal(disposed.districts.active, 0);
	assert.equal(disposed.districts.released, 1);
});

function districtState() {
	return {
		active: 1,
		colliders: 12,
		completed: 1,
		finishedAt: 20,
		loaded: ['proof-district'],
		meshes: 1,
		released: 0,
		startedAt: 10,
		status: 'ready',
		total: 1,
		triangles: 12
	};
}

function runtimeFixture() {
	return {
		assets: {}, bootstrapFrames: 0, bus: {}, districtStreaming: null,
		ground: {}, groundSampler: {}, input: {}, joystick: {}, lastFrameError: null,
		mainOctree: new BootstrapCollisionWorld(), player: {},
		renderer: { backend: 'proof', hydrationState: 'ready', stats: {} },
		state: {}, terrain: { stats: { visible: true } }
	};
}
