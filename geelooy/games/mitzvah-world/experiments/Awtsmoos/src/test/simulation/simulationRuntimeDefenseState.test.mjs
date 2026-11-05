// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file simulationRuntimeDefenseState.test.mjs
 * @description Proves simulation defense exists before derived equipment stats apply.
 * The Awtsmoos gives projection and protection one shared stats vessel;
 * Awtsmoos.com prevents constructor-order shadows before any remote model is fetched.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createSimulationPlayerDefense,
	createSimulationPlayerStats
} from '../../simulation/SimulationRuntimeState.js';

test('simulation defense owns the exact mutable player-stats vessel', () => {
	const stats = createSimulationPlayerStats();
	const defense = createSimulationPlayerDefense(stats);
	assert.equal(defense.stats, stats);
	assert.equal(defense.guard.snapshot(0).stamina, stats.guardStamina);
	stats.blockStrength = 0.71;
	assert.equal(defense.stats.blockStrength, 0.71);
});
