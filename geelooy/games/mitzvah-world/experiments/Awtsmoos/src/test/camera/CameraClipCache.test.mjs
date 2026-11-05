// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CameraClipCache.test.mjs
 * @description Proves bounded collision reuse follows motion and respects world revisions.
 * The Awtsmoos renews camera and wall without stale confusion; Awtsmoos.com verifies that
 * recent safe distance moves with the traveler while changed collision ownership refreshes truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { CameraClipCache } from '../../camera/CameraClipCache.js';

test('two reuse frames avoid duplicate raycasts while eye follows target motion', () => {
	const octree = fakeOctree(5);
	const cache = new CameraClipCache({ maximumReuseFrames: 2 });
	const first = cache.resolve(point(0, 0, 0), point(0, 0, 10), octree, 0.8);
	const second = cache.resolve(point(0.1, 0, 0), point(0.1, 0, 10), octree, 0.8);
	const third = cache.resolve(point(0.2, 0, 0), point(0.2, 0, 10), octree, 0.8);
	const fourth = cache.resolve(point(0.3, 0, 0), point(0.3, 0, 10), octree, 0.8);
	assert.equal(octree.calls, 2);
	assert.equal(first.cached, false);
	assert.equal(second.cached, true);
	assert.equal(third.cached, true);
	assert.equal(fourth.cached, false);
	assert.ok(Math.abs(second.eye.x - 0.1) < 0.000001);
	assert.ok(Math.abs(second.eye.z - 4.58) < 0.000001);
	assert.deepEqual(cache.diagnostics(), {
		hits: 2,
		maximumReuseFrames: 2,
		misses: 2,
		reusedFrames: 0,
		revisionInvalidations: 0
	});
});

test('collision revision invalidates an otherwise identical pose', () => {
	const octree = fakeOctree(5);
	const cache = new CameraClipCache({ maximumReuseFrames: 20 });
	cache.resolve(point(0, 0, 0), point(0, 0, 10), octree, 0.8);
	cache.resolve(point(0, 0, 0), point(0, 0, 10), octree, 0.8);
	octree.revision = 'two';
	cache.resolve(point(0, 0, 0), point(0, 0, 10), octree, 0.8);
	assert.equal(octree.calls, 2);
	assert.equal(cache.diagnostics().revisionInvalidations, 1);
});

test('large camera motion refreshes before the reuse bound', () => {
	const octree = fakeOctree(null);
	const cache = new CameraClipCache({ maximumReuseFrames: 20 });
	cache.resolve(point(0, 0, 0), point(0, 0, 10), octree, 0.8);
	const result = cache.resolve(point(2, 0, 0), point(2, 0, 10), octree, 0.8);
	assert.equal(octree.calls, 2);
	assert.equal(result.cached, false);
	assert.deepEqual(result.eye, point(2, 0, 10));
});

function fakeOctree(hitDistance) {
	return {
		calls: 0,
		revision: 'one',
		raycast() {
			this.calls += 1;
			return hitDistance === null
				? null
				: { distance: hitDistance, item: { kind: 'stone-wall' } };
		}
	};
}

function point(x, y, z) {
	return { x, y, z };
}
