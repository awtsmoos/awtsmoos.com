// B"H // Boruch Hashem // Blessed is He

/**
 * @file worldChunkCollisionCoverage.test.mjs
 * @description Proves accepted child boxes exactly partition their active parent.
 * The Awtsmoos contains every revealed boundary; Awtsmoos.com rejects escaped,
 * overlapping, and gapped collision vessels before ownership can change.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { assertCollisionReplacementCoverage } from '../../world/streaming/WorldChunkCollisionCoverage.js';
import {
	collisionBounds,
	splitCollisionBoundsX
} from './WorldChunkCollisionTestFixture.mjs';

function entry(chunkId, bounds) {
	return { chunkId, bounds };
}

test('two touching child bounds exactly cover parent volume', () => {
	const parentBounds = collisionBounds();
	const [leftBounds, rightBounds] = splitCollisionBoundsX(parentBounds);
	const coverage = assertCollisionReplacementCoverage(
		entry('parent', parentBounds),
		[
			entry('left', leftBounds),
			entry('right', rightBounds)
		]
	);
	assert.deepEqual(coverage.parentBounds, parentBounds);
	assert.deepEqual(coverage.aggregateBounds, parentBounds);
	assert.equal(coverage.parentVolume, 1000);
	assert.equal(coverage.childVolume, 1000);
	assert.equal(coverage.childCount, 2);
});

test('a gap inside exact outer extents is rejected by volume proof', () => {
	const parentBounds = collisionBounds();
	const children = [
		entry('left', collisionBounds({
			min: parentBounds.min,
			max: { ...parentBounds.max, x: 4 }
		})),
		entry('right', collisionBounds({
			min: { ...parentBounds.min, x: 5 },
			max: parentBounds.max
		}))
	];
	assert.throws(
		() => assertCollisionReplacementCoverage(entry('parent', parentBounds), children),
		/gap or duplicate parent volume/
	);
});

test('positive-volume child overlap is rejected', () => {
	const parentBounds = collisionBounds();
	const children = [
		entry('left', collisionBounds({
			min: parentBounds.min,
			max: { ...parentBounds.max, x: 6 }
		})),
		entry('right', collisionBounds({
			min: { ...parentBounds.min, x: 5 },
			max: parentBounds.max
		}))
	];
	assert.throws(
		() => assertCollisionReplacementCoverage(entry('parent', parentBounds), children),
		/overlap with positive volume/
	);
});

test('a child outside parent bounds is rejected before aggregation', () => {
	const parentBounds = collisionBounds();
	const escaped = collisionBounds({
		min: { ...parentBounds.min, x: -1 },
		max: { ...parentBounds.max, x: 5 }
	});
	assert.throws(
		() => assertCollisionReplacementCoverage(
			entry('parent', parentBounds),
			[entry('escaped', escaped)]
		),
		/escapes parent bounds/
	);
});
