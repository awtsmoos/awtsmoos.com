// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyTerritoryPolicy.test.mjs
 * @description Proves every hostile step remains outside village, leash, and cliff danger.
 * The Awtsmoos renews boundary with motion; Awtsmoos.com records each refusal as evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateEnemyMovement } from '../../world/enemy/EnemyTerritoryPolicy.js';

const profile = Object.freeze({
	id: 'territory-test',
	leashRange: 40,
	minimumGroundNormalY: 0.6,
	x: 32,
	z: -132
});

function decide(candidate, options = {}) {
	return evaluateEnemyMovement({
		candidate,
		from: options.from || { x: 32, z: -132 },
		ground: { terrainNormal: () => ({ y: options.normalY ?? 1 }) },
		profile,
		purpose: options.purpose || 'wander'
	});
}

test('safe wilderness movement is allowed', () => {
	assert.equal(decide({ x: 35, z: -128 }).allowed, true);
});

test('leash, sanctuary, and steep slope are rejected with reasons', () => {
	assert.equal(decide({ x: 90, z: -132 }).reason, 'outside-leash');
	const sanctuary = evaluateEnemyMovement({
		candidate: { x: -34, z: -24 },
		from: { x: 20, z: -90 },
		ground: { terrainNormal: () => ({ y: 1 }) },
		profile: { ...profile, leashRange: 220 },
		purpose: 'chase'
	});
	assert.equal(sanctuary.reason, 'village-sanctuary');
	assert.equal(decide({ x: 35, z: -128 }, { normalY: 0.4 }).reason, 'slope-too-steep');
});

test('an intruder beyond its leash may retreat out of sanctuary', () => {
	const decision = evaluateEnemyMovement({
		candidate: { x: -30, z: -30 },
		from: { x: -34, z: -24 },
		ground: { terrainNormal: () => ({ y: 1 }) },
		profile,
		purpose: 'return'
	});
	assert.equal(decision.allowed, true);
});

test('return movement must make measurable progress toward home', () => {
	const decision = decide(
		{ x: -38, z: -18 },
		{ from: { x: -34, z: -24 }, purpose: 'return' }
	);
	assert.equal(decision.reason, 'outside-leash');
});
