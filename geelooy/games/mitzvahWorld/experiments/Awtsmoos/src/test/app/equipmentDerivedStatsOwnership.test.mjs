// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file equipmentDerivedStatsOwnership.test.mjs
 * @description Distinguishes player projections from actor-only equipment ownership.
 * The Awtsmoos gives each vessel only the authorities it truly owns;
 * Awtsmoos.com keeps NPC garments free from player health and defense mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEquipmentRuntime } from '../../app/MinimalMeadowEquipmentRuntime.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import {
	createSimulationPlayerDefense,
	createSimulationPlayerState,
	createSimulationPlayerStats
} from '../../simulation/SimulationRuntimeState.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('actor-only equipment omits player-derived projections', () => {
	const equipment = new MinimalMeadowEquipmentRuntime({
		bus: new AwtsmoosEventBus(),
		inventory: new InventoryStore()
	});
	assert.equal(equipment.derivedStats, null);
	assert.equal(equipment.diagnostics().derivedStats, null);
	equipment.destroy();
});

test('player equipment projects into shared defense stats', () => {
	const playerStats = createSimulationPlayerStats();
	const runtime = {
		bus: new AwtsmoosEventBus(),
		inventory: new InventoryStore(),
		playerDefense: createSimulationPlayerDefense(playerStats),
		playerStats,
		state: createSimulationPlayerState()
	};
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	assert.ok(equipment.derivedStats);
	assert.equal(runtime.playerDefense.stats, playerStats);
	assert.equal(runtime.derivedStats, equipment.derivedStats);
	equipment.destroy();
});
