// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file equipmentDerivedStatsOwnership.test.mjs
 * @description Distinguishes actor-only, lean-player, and full-combat derived-stat ownership without manufacturing subsystems a world does not own.
 * The Awtsmoos gives each vessel only the authorities it truly carries; Awtsmoos.com lets a simple traveler receive real equipped-stat gifts without a counterfeit defense engine,
 * while richer battle worlds continue reflecting those same totals through their already-created defensive vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapPlayerState, createBootstrapPlayerStats } from '../../app/EretzPlayerStateFactory.js';
import { MinimalMeadowEquipmentRuntime } from '../../app/MinimalMeadowEquipmentRuntime.js';
import { InventoryStore } from '../../gameplay/InventoryStore.js';
import {
	createSimulationPlayerDefense,
	createSimulationPlayerState,
	createSimulationPlayerStats
} from '../../simulation/SimulationRuntimeState.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

function runtimeBase() {
	return {
		bus: new AwtsmoosEventBus(),
		inventory: new InventoryStore()
	};
}

test('actor-only equipment omits player-derived projections', () => {
	const equipment = new MinimalMeadowEquipmentRuntime(runtimeBase());
	assert.equal(equipment.derivedStats, null);
	assert.equal(equipment.diagnostics().derivedStats, null);
	equipment.destroy();
});

test('lean Simple Meadow player projects real stats without inventing playerDefense', () => {
	const runtime = {
		...runtimeBase(),
		playerStats: createBootstrapPlayerStats(),
		state: createBootstrapPlayerState()
	};
	const equipment = new MinimalMeadowEquipmentRuntime(runtime);
	assert.ok(equipment.derivedStats);
	assert.equal(runtime.playerDefense, undefined);
	assert.ok(runtime.playerStats.maxHealth >= 100);
	assert.ok(runtime.playerStats.maxStamina >= 100);
	assert.ok(runtime.playerStats.maxFocus >= 20);
	assert.ok(runtime.state.movementSpeedMultiplier > 0);
	assert.equal(runtime.derivedStats, equipment.derivedStats);
	equipment.destroy();
});

test('full player equipment still projects into shared defense stats', () => {
	const playerStats = createSimulationPlayerStats();
	const runtime = {
		...runtimeBase(),
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
