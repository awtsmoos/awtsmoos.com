// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionIncrementalControl.test.mjs
 * @description Proves zero budgets, disposal, and unsupported sources stay safe.
 * The Awtsmoos never needs a rushed vessel; Awtsmoos.com permits pause, release,
 * and honest failure without exposing a half-built collision child to the world.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { TriangleCollider } from '../../collision/TriangleCollider.js';
import { Vec3 } from '../../math/Vec3.js';
import { createIncrementalCollisionFixture } from './WorldChunkCollisionIncrementalFixture.mjs';

test('zero budget preserves phase, counters, and ownership-free state', () => {
	const fixture = createIncrementalCollisionFixture();
	const before = fixture.generator.diagnostics();
	const receipt = fixture.generator.step({ maximumUnits: 0 });
	assert.equal(receipt.units, 0);
	assert.deepEqual(fixture.generator.diagnostics(), before);
	assert.throws(() => fixture.generator.result(), /not complete/);
});

test('disposal releases generation structures and forbids useful completion', () => {
	const fixture = createIncrementalCollisionFixture();
	fixture.generator.step({ maximumUnits: 5 });
	fixture.generator.dispose('test-cancellation');
	const diagnostics = fixture.generator.diagnostics();
	assert.equal(diagnostics.phase, 'disposed');
	assert.equal(diagnostics.disposedReason, 'test-cancellation');
	assert.equal(diagnostics.sources, null);
	assert.equal(fixture.generator.step({ maximumUnits: 5 }).units, 0);
	assert.throws(() => fixture.generator.result(), /not complete/);
});

test('nontriangle colliders fail during bounded source scanning', () => {
	const fixture = createIncrementalCollisionFixture({
		triangles: [{
			aabb: fixtureBounds(),
			kind: 'not-a-triangle'
		}]
	});
	fixture.generator.step({ maximumUnits: 1 });
	assert.throws(
		() => fixture.generator.step({ maximumUnits: 1 }),
		/triangle colliders only/
	);
});

test('completed generation stores every assigned triangle in its child octree', () => {
	const fixture = createIncrementalCollisionFixture();
	while (!fixture.generator.diagnostics().completed) {
		fixture.generator.step({ maximumUnits: 11 });
	}
	for (const definition of fixture.generator.result().definitions) {
		assert.equal(definition.octree.all([]).length, definition.triangleKeys.length);
	}
});

function fixtureBounds() {
	return new TriangleCollider(
		new Vec3(0, 0, 0),
		new Vec3(1, 0, 0),
		new Vec3(0, 1, 0)
	).aabb;
}
