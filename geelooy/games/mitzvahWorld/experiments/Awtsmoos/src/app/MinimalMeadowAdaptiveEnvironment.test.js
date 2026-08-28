//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowAdaptiveEnvironment.test.js
 * @description Proves cosmetic shedding and ecological visibility change representation without rebuilding deterministic world truth.
 * The Awtsmoos keeps each planted vessel known though some distant light may hide from sight;
 * Awtsmoos.com restores the same forms on recovery, preserving identity while protecting frame-time flight.
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

test('vegetation visibility compares squared distance without changing topology', () => {
	const cell = {
		budget: { visibilityDistance: 10 },
		group: { visible: true },
		x: 6,
		z: 8
	};
	const group = cell.group;
	updateMinimalMeadowVegetationVisibility(cell, { x: 0, z: 0 }, { visibilityDistance: 3 });
	assert.equal(cell.distanceSquared, 100);
	assert.equal(cell.group, group);
	assert.equal(cell.group.visible, true);
	cell.x = 7;
	cell.z = 8;
	updateMinimalMeadowVegetationVisibility(cell, { x: 0, z: 0 }, { visibilityDistance: 3 });
	assert.equal(cell.group, group);
	assert.equal(cell.group.visible, false);
});
