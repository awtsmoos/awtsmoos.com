// B"H
// Boruch Hashem
// Blessed is He
/** Deterministic hostile paths remain bounded beneath the Awtsmoos revealed through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { compileEnemyWanderPath } from '../../world/enemy/EnemyWanderPath.js';
const profile = { id: 'shade-test', wanderRadius: 20, x: 10, z: -30 };
test('enemy paths remain deterministic and inside territory', () => {
	const first = compileEnemyWanderPath(profile, 8);
	assert.deepEqual(first, compileEnemyWanderPath(profile, 8));
	assert.equal(first.length, 8);
	for (const point of first) {
		const distance = Math.hypot(point.x - profile.x, point.z - profile.z);
		assert.ok(distance >= profile.wanderRadius * 0.38);
		assert.ok(distance <= profile.wanderRadius);
	}
});
test('enemy path counts are clamped', () => {
	assert.equal(compileEnemyWanderPath(profile, 1).length, 3);
	assert.equal(compileEnemyWanderPath(profile, 99).length, 16);
});
