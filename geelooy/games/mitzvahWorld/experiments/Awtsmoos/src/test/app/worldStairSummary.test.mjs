// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldStairSummary.test.mjs
 * @description Guards the stair diagnostic contract after its decomposition from
 * central runtime diagnostics, preserving every measured ascent before Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeWorldStairs } from '../../app/WorldStairSummary.js';

test('stair summary preserves layout, collision, and dimension aggregates', () => {
	const items = [
		{
			houseId: 'house-a',
			kind: 'front',
			collisionTriangles: 4,
			length: 6,
			width: 2,
			totalRise: 1.2,
			stepCount: 6,
			stepRise: 0.2,
			stepRun: 1
		},
		{
			houseId: 'house-b',
			kind: 'side',
			collisionTriangles: 6,
			length: 8,
			width: 3,
			totalRise: 2,
			stepCount: 10,
			stepRise: 0.2,
			stepRun: 0.8
		}
	];
	const triangles = [
		{ kind: 'stair:house-a:front' },
		{ kind: 'stair:house-a:front' },
		{ kind: 'stair:house-b:side' },
		{ kind: 'stair:unmatched:repair' }
	];
	const summary = summarizeWorldStairs(items, triangles);
	assert.equal(summary.count, 2);
	assert.deepEqual(summary.countsByKind, { front: 1, side: 1 });
	assert.equal(summary.expectedCollisionTriangles, 10);
	assert.equal(summary.totalCollisionTriangles, 4);
	assert.equal(summary.matchedCollisionTriangles, 3);
	assert.equal(summary.unmatchedCollisionTriangles, 1);
	assert.equal(summary.minimumLength, 6);
	assert.equal(summary.maximumLength, 8);
	assert.equal(summary.minimumWidth, 2);
	assert.equal(summary.maximumWidth, 3);
	assert.equal(summary.minimumRise, 1.2);
	assert.equal(summary.maximumRise, 2);
	assert.equal(summary.minimumSteps, 6);
	assert.equal(summary.maximumSteps, 10);
	assert.equal(summary.averageStepRise, 0.2);
	assert.equal(summary.averageStepRun, 0.9);
	assert.equal(summary.totalSteps, 16);
});

test('empty stair input returns zero dimensions without infinities', () => {
	const summary = summarizeWorldStairs([], []);
	assert.equal(summary.count, 0);
	assert.equal(summary.minimumLength, 0);
	assert.equal(summary.maximumLength, 0);
	assert.equal(summary.averageStepRise, 0);
	assert.equal(summary.totalSteps, 0);
});