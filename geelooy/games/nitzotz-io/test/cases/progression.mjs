// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { evaluateAchievements } from '../../js/progression/achievements.js';
import { finishRound, selectMode, upgrades } from '../../js/game/progression.js';
import { loadSave } from '../../js/save.js';
import { createWorld } from '../../js/state.js';

/** Awtsmoos.com tests that old history enters new progression without duplication. */
export function runProgressionCases() {
	return [
		checkSaveMigration(),
		checkAchievementUnlock(),
		checkModeRecord(),
		checkRewardIdempotency(),
		checkReverseObjective()
	];
}

function checkSaveMigration() {
	const original = globalThis.localStorage;
	globalThis.localStorage = {
		getItem: () => JSON.stringify({ best: 99, stars: { malchus: 2 }, currentLevel: 1, unlocked: 5, perf: 'low' })
	};
	const save = loadSave();
	if (original === undefined) delete globalThis.localStorage;
	else globalThis.localStorage = original;
	assert.equal(save.schemaVersion, 3);
	assert.equal(save.stars['malchus-01'], 2);
	assert.equal(save.stars.malchus, undefined);
	assert.equal(save.currentLevel, 20);
	assert.equal(save.unlocked, 160);
	assert.equal(save.selectedMode, 'classic');
	return { test: 'save-migration', currentLevel: save.currentLevel, unlocked: save.unlocked };
}

function checkAchievementUnlock() {
	const world = createWorld();
	world.telemetry.captures = 1;
	const unlocked = evaluateAchievements(world);
	assert.ok(unlocked.some(item => item.id === 'firstLight'));
	assert.ok(world.save.achievements.firstLight);
	return { test: 'achievement', unlocked: unlocked.map(item => item.id) };
}

function checkModeRecord() {
	const world = createWorld();
	world.mode = 'playing';
	world.player.mass = world.level.targetMass * 2;
	world.consumed[world.level.bonus.category] = world.level.bonus.target;
	finishRound(world);
	const record = world.save.modeRecords.classic;
	assert.equal(record.plays, 1);
	assert.equal(record.wins, 1);
	assert.ok(record.bestMass >= world.level.targetMass);
	assert.ok(world.save.sparks > 0);
	return { test: 'mode-record', plays: record.plays, sparks: world.save.sparks };
}

function checkRewardIdempotency() {
	const world = createWorld();
	world.mode = 'playing';
	world.player.mass = world.level.targetMass * 2;
	world.consumed[world.level.bonus.category] = world.level.bonus.target;
	finishRound(world);
	const firstReward = world.save.sparks;
	world.mode = 'playing';
	finishRound(world);
	assert.equal(world.save.sparks, firstReward);
	assert.equal(world.save.campaignStats.wins, 1);
	return { test: 'reward-idempotency', sparks: firstReward };
}

function checkReverseObjective() {
	const world = createWorld();
	selectMode(world, 'reverse');
	world.consumed.landmark = 3;
	upgrades(world);
	assert.equal(world.objectiveMet, true);
	return { test: 'reverse-objective', mass: world.player.mass, landmarks: world.consumed.landmark };
}
