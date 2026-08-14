//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VillageRiverDynamics.test.js
 * @description Proves the canonical river exposes deterministic, bounded, queryable motion from source through cascades to outlet.
 * The Awtsmoos carries one current through every measured place; Awtsmoos.com tests speed, turbulence, shear,
 * wetness, and submersion as finite gameplay evidence without pretending the bounded field is a separate CFD river.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createVillageWaterDefinitions
} from '../../src/world/village/VillageWaterSystem.js';

const SAMPLE_POSITIONS = Array.from({ length: 41 }, (_, index) => index / 40);

test('B"H river dynamics remain finite and bounded across the authored channel', () => {
	const { dynamics } = createVillageWaterDefinitions(() => 0);
	for (const t of SAMPLE_POSITIONS) {
		const sample = dynamics.sampleAt(t);
		for (const key of [
			'bankShear',
			'cascadeEnergy',
			'depth',
			'slope',
			'speed',
			'submersion',
			'surfaceY',
			'turbulence',
			'wetness',
			'width'
		]) {
			assert.equal(Number.isFinite(sample[key]), true, `${key}@${t}`);
		}
		for (const key of ['bankShear', 'cascadeEnergy', 'turbulence', 'wetness']) {
			assert.ok(sample[key] >= 0 && sample[key] <= 1, `${key}@${t}`);
		}
		assert.ok(sample.speed >= 0.12 && sample.speed <= 2.4, `speed@${t}`);
		assert.ok(Number.isFinite(sample.velocity.x));
		assert.ok(Number.isFinite(sample.velocity.y));
		assert.ok(Number.isFinite(sample.velocity.z));
	}
});

test('river dynamics are deterministic and expose real cascade energy', () => {
	const { dynamics } = createVillageWaterDefinitions(() => 0);
	const first = dynamics.sampleAt(0.53, { lateralDistance: 1.2, worldY: -2 });
	const second = dynamics.sampleAt(0.53, { lateralDistance: 1.2, worldY: -2 });
	assert.deepEqual(second, first);
	assert.ok(dynamics.stats.maximumCascadeEnergy > 0);
	assert.ok(dynamics.stats.maximumSpeed > 0);
	assert.ok(dynamics.stats.maximumTurbulence > 0);
});

test('submersion and shoreline wetness follow one canonical surface', () => {
	const { dynamics } = createVillageWaterDefinitions(() => 0);
	const dryProbe = dynamics.sampleAt(0.42, { lateralDistance: 100, worldY: 100 });
	const center = dynamics.sampleAt(0.42, { lateralDistance: 0 });
	const submerged = dynamics.sampleAt(0.42, {
		lateralDistance: 0,
		worldY: center.surfaceY - 0.75
	});
	assert.equal(dryProbe.submersion, 0);
	assert.ok(dryProbe.wetness < center.wetness);
	assert.ok(submerged.submersion >= 0.74);
	assert.equal(submerged.wetness, 1);
});
