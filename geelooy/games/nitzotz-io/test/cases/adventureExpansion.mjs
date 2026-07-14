// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { selectShlichus } from '../../js/adventure/catalog.js';
import { settleAdventureReward } from '../../js/adventure/rewards.js';
import { updateAdventure } from '../../js/adventure/runtime.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { resetToLevel } from '../../js/game/reset.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos verifies deterministic three-stage missions, bounded targets,
 * baseline progress, and one-time victorious perutah settlement.
 */
export function runAdventureExpansionCases() {
	return [
		checkDeterministicCatalog(),
		checkAllDistrictTargets(),
		checkStageProgressAndSettlement(),
		checkInactiveClassicMode()
	];
}

function checkDeterministicCatalog() {
	const level = { ...LEVELS[37], index: 37 };
	const first = selectShlichus(level, 'adventure');
	const replay = selectShlichus(level, 'adventure');
	assert.deepEqual(first, replay);
	assert.equal(new Set(first.map(step => step.id)).size, 3);
	return { test: 'adventure-deterministic-catalog', steps: first.map(step => step.id) };
}

function checkAllDistrictTargets() {
	for (const config of LEVELS) {
		const level = { ...config, index: config.globalIndex };
		const steps = selectShlichus(level, 'adventure');
		assert.equal(steps.length, 3);
		for (const step of steps) {
			assert.ok(Number.isFinite(step.target) && step.target > 0);
			assert.ok(step.target < 5000, `${level.key}:${step.id}:${step.target}`);
			assert.ok(step.reward >= 5 && step.reward <= 20);
		}
	}
	return { test: 'adventure-all-district-targets', districts: LEVELS.length };
}

function checkStageProgressAndSettlement() {
	const world = adventureWorld();
	const initialPerutot = world.save.perutot;
	for (let index = 0; index < 3; index += 1) {
		const step = world.adventure.steps[world.adventure.currentIndex];
		satisfy(world, step);
		updateAdventure(world);
		assert.equal(step.complete, true);
	}
	assert.equal(world.adventure.complete, true);
	const first = settleAdventureReward(world, true);
	const second = settleAdventureReward(world, true);
	assert.ok(first.perutot > 0);
	assert.equal(second.perutot, 0);
	assert.equal(world.save.perutot, initialPerutot + first.perutot);
	assert.equal(world.save.adventureStats.completions, 1);
	return { test: 'adventure-stage-settlement', perutot: first.perutot };
}

function checkInactiveClassicMode() {
	const world = createWorld();
	assert.equal(world.gameMode.id, 'classic');
	assert.equal(world.adventure.active, false);
	assert.equal(world.adventure.steps.length, 0);
	return { test: 'adventure-classic-inactive', active: false };
}

function adventureWorld() {
	const world = createWorld();
	world.save.selectedMode = 'adventure';
	resetToLevel(world, 0, 'playing', 'Adventure test.');
	return world;
}

function satisfy(world, step) {
	if (step.metric === 'captures') world.telemetry.captures = step.baseline + step.target;
	if (step.metric === 'mass') world.player.mass = step.baseline + step.target;
	if (step.metric === 'districts') world.telemetry.districtCount = step.target;
	if (step.metric === 'chain') world.telemetry.maxChain = step.target;
	if (step.metric === 'rivals') world.telemetry.rivalsEaten = step.baseline + step.target;
	if (step.metric === 'powerups') world.telemetry.powerups = step.baseline + step.target;
	if (step.metric === 'impacts') world.telemetry.impacts = step.baseline + step.target;
	if (step.metric === 'category') world.consumed[step.category] = step.baseline + step.target;
}
