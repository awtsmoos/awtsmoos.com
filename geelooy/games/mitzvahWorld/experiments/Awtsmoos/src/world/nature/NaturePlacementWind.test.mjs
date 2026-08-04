// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NaturePlacementWind.test.mjs
 * @description Proves deterministic hero rings, slope gates, and shared wind cadence.
 * The Awtsmoos sets each root by measure and sends one breath through every living kind;
 * Awtsmoos.com tests the ring and clock, so settlement grace and mobile rhythm stay aligned.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNaturePlacements } from './NaturePlacementField.js';
import { natureQualityBudget } from './NatureQualityBudget.js';
import {
	SharedWindField,
	sharedWindEvidence
} from './SharedWindField.js';

const FLAT_GROUND = Object.freeze({
	heightAt(x, z) {
		return { normal: { y: 1 }, y: x * 0.001 + z * 0.001 };
	}
});

test('placement is deterministic, bounded, and settlement-aware', () => {
	const budget = natureQualityBudget('low');
	const first = createNaturePlacements(FLAT_GROUND, budget);
	const second = createNaturePlacements(FLAT_GROUND, budget);
	assert.deepEqual(first, second);
	assert.equal(first.length, 5);
	assert.deepEqual([...new Set(first.map(item => item.asset.id))].sort(), [
		'broadleaf',
		'bush',
		'flower',
		'pine',
		'rock'
	]);
	for (const placement of first) {
		const radius = Math.hypot(placement.x, placement.z);
		if (placement.asset.family === 'flower') assert.ok(radius >= 16 && radius <= 36);
		if (placement.asset.family === 'bush') assert.ok(radius >= 24 && radius <= 48);
		if (placement.asset.family === 'tree') assert.ok(radius >= 62 && radius <= 138);
		if (placement.asset.family === 'rock') assert.ok(radius >= 42 && radius <= 92);
		assert.ok(Number.isFinite(placement.y));
	}
});

test('placement rejects slopes that cannot safely hold nature', () => {
	const steepGround = {
		heightAt() {
			return { normal: { y: 0.4 }, y: 3 };
		}
	};
	assert.deepEqual(createNaturePlacements(steepGround, natureQualityBudget('low')), []);
});

test('shared wind is throttled, bounded, and quality-aware', () => {
	const writes = [];
	const instance = {
		placement: {
			asset: { windAmplitude: 0.05 },
			index: 2,
			yaw: 1.2
		},
		scene: {
			quaternion: {
				set(...values) {
					writes.push(values);
				}
			}
		}
	};
	const wind = new SharedWindField({ framesPerSecond: 10 });
	assert.equal(wind.update(0, [instance]), true);
	assert.equal(wind.update(0.02, [instance]), false);
	assert.equal(wind.update(0.2, [instance]), true);
	assert.equal(writes.length, 2);
	assert.equal(writes.every(values => values.every(Number.isFinite)), true);
	assert.ok(sharedWindEvidence('high').framesPerSecond > sharedWindEvidence('low').framesPerSecond);
});
