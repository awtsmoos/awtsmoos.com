// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAdaptiveEnvironment.test.js
 * @description Proves cosmetic shedding and vegetation distance transitions change representation without rebuilding deterministic world truth.
 * The Awtsmoos keeps every planted vessel known while distance lowers its visible height into earth;
 * Awtsmoos.com restores the same pool and topology on return, protecting frame time without an abrupt grass horizon.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowAmbientMotes } from './MinimalMeadowAmbientMotes.js';
import { updateMinimalMeadowVegetationVisibility } from './MinimalMeadowVegetationVisibility.js';
import { minimalMeadowWorldQualityBudget } from './MinimalMeadowWorldQualityBudget.js';

function moteSystem(count = 10) {
	const system = Object.create(MinimalMeadowAmbientMotes.prototype);
	system.motes = Array.from({ length: count }, () => ({ mesh: { visible: true } }));
	system.adaptiveLevel = '';
	system.visibleCount = count;
	return system;
}

test('ambient shedding hides a stable prefix boundary and recovers the same pool', () => {
	const system = moteSystem();
	const originalMotes = [...system.motes];
	system.applyAdaptiveVisibility(minimalMeadowWorldQualityBudget('performance'));
	assert.equal(system.visibleCount, 7);
	assert.deepEqual(system.motes.map(mote => mote.mesh.visible), [
		true, true, true, true, true, true, true, false, false, false
	]);
	system.applyAdaptiveVisibility(minimalMeadowWorldQualityBudget('quality'));
	assert.equal(system.visibleCount, 10);
	assert.deepEqual(system.motes, originalMotes);
	assert.equal(system.motes.every(mote => mote.mesh.visible), true);
});

test('reapplying the same ambient level does not touch existing visibility', () => {
	const system = moteSystem(4);
	const budget = minimalMeadowWorldQualityBudget('balanced');
	system.applyAdaptiveVisibility(budget);
	system.motes[0].mesh.visible = false;
	system.applyAdaptiveVisibility(budget);
	assert.equal(system.motes[0].mesh.visible, false);
});

test('vegetation fades vertically into terrain before final cull without changing topology', () => {
	const scale = scaleFixture();
	const cell = {
		budget: { visibilityDistance: 10 },
		group: { scale, visible: true },
		x: 6,
		z: 0
	};
	const group = cell.group;
	updateMinimalMeadowVegetationVisibility(cell, { x: 0, z: 0 }, { visibilityDistance: 3 });
	assert.equal(cell.visibilityFade, 1);
	assert.deepEqual(scale.values, [1, 1, 1]);
	cell.x = 9;
	updateMinimalMeadowVegetationVisibility(cell, { x: 0, z: 0 }, { visibilityDistance: 3 });
	assert.ok(cell.visibilityFade > 0 && cell.visibilityFade < 1);
	assert.equal(cell.group, group);
	assert.equal(scale.values[0], 1);
	assert.equal(scale.values[2], 1);
	assert.equal(scale.values[1], cell.visibilityFade);
	cell.x = 11;
	updateMinimalMeadowVegetationVisibility(cell, { x: 0, z: 0 }, { visibilityDistance: 3 });
	assert.equal(cell.group.visible, false);
	assert.equal(cell.visibilityFade, 0);
	assert.deepEqual(scale.values, [1, 0.04, 1]);
});

function scaleFixture() {
	return {
		values: [1, 1, 1],
		set(x, y, z) {
			this.values = [x, y, z];
		}
	};
}
