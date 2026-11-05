// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file forestPlacementEcology.test.mjs
 * @description Proves deep-core trees are deterministically grounded outside every shared exclusion with crown-aware spacing.
 * The Awtsmoos lets one forest breathe around river, road, house, stair, and clearing; Awtsmoos.com tests
 * placement as ecology only while structural branch generation remains sealed inside the deeper `geelooy/libs` root.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createForestPlacements } from '../../world/trees/ForestPlacement.js';
import { createForestPolicy } from '../../world/trees/ForestPolicy.js';

const flatGround = {
	heightAt: (x, z) => ({ normal: { x: 0, y: 1, z: 0 }, y: x * 0.001 - z * 0.001 })
};
const policies = Array.from({ length: 12 }, (_, index) => {
	return createForestPolicy(index % 2 ? 'Oak Medium' : 'Pine Large', index, 'high');
});

test('forest placement is deterministic and complete on open canonical terrain', () => {
	const first = createForestPlacements(policies, {
		groundSampler: flatGround,
		halfSize: 400,
		obstacleTriangles: [],
		seed: 613
	});
	const second = createForestPlacements(policies, {
		groundSampler: flatGround,
		halfSize: 400,
		obstacleTriangles: [],
		seed: 613
	});
	assert.equal(first.placements.length, policies.length);
	assert.deepEqual(
		first.placements.map(record),
		second.placements.map(record)
	);
	assert.ok(first.sources.includes('canonical-architecture-approaches'));
	assert.ok(first.sources.includes('canonical-water-corridor'));
});

test('every accepted tree has valid shared ecology and crown spacing', () => {
	const placement = createForestPlacements(policies, {
		groundSampler: flatGround,
		halfSize: 400,
		obstacleTriangles: [],
		seed: 613
	});
	for (const tree of placement.placements) {
		assert.equal(tree.ecology.valid, true);
		assert.ok(tree.ecology.approach >= 0);
		assert.ok(tree.ecology.footprint >= 0);
		assert.ok(tree.ecology.river >= 0);
		assert.ok(tree.ecology.road >= 0);
		assert.ok(tree.ecology.slope >= 0);
	}
	for (let index = 0; index < placement.placements.length; index += 1) {
		for (let other = index + 1; other < placement.placements.length; other += 1) {
			const first = placement.placements[index];
			const second = placement.placements[other];
			const distance = Math.hypot(first.x - second.x, first.z - second.z);
			assert.ok(distance + 1e-9 >= first.siteRadius + second.siteRadius);
		}
	}
});

function record(placement) {
	return {
		runtimeProfile: placement.policy.runtimeProfile,
		siteRadius: placement.siteRadius,
		x: placement.x,
		y: placement.y,
		z: placement.z
	};
}
