// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file riverReachRealism.test.mjs
 * @description Proves one Awtsmoos.com river can gain distinct reach character without mutating its base evidence or creating another solver.
 * The Awtsmoos renews narrow riffle and broad pool upon one current; this test guards that unity through immutable scaled evidence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRiverReachRealismAuthority } from '../src/core/ecosystem/index.js';

const authority = createRiverReachRealismAuthority([
	{
		depthScale: 0.8,
		flowScale: 1.3,
		from: 0,
		id: 'riffle',
		riffleStrength: 0.9,
		to: 0.5,
		widthScale: 0.9
	},
	{
		depthScale: 1.5,
		flowScale: 0.6,
		from: 0.5,
		id: 'pool',
		poolStrength: 0.8,
		to: 1,
		widthScale: 1.8
	}
]);

test('reach policy scales existing evidence without mutation', () => {
	const base = Object.freeze({
		bankWetness: 0.4,
		depth: 2,
		flowSpeed: 1,
		width: 10
	});
	const pool = authority.sample(0.7, base);
	assert.equal(pool.reachId, 'pool');
	assert.equal(pool.width, 18);
	assert.equal(pool.depth, 3);
	assert.equal(pool.flowSpeed, 0.6);
	assert.equal(pool.poolStrength, 0.8);
	assert.deepEqual(base, {
		bankWetness: 0.4,
		depth: 2,
		flowSpeed: 1,
		width: 10
	});
	assert.equal(Object.isFrozen(pool), true);
});

test('normalized progress resolves the correct authored reach', () => {
	assert.equal(authority.reachAt(0.2).id, 'riffle');
	assert.equal(authority.reachAt(0.8).id, 'pool');
});
