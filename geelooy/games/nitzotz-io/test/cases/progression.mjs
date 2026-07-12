// B"H
import assert from 'node:assert/strict';
import { evaluateAchievements } from '../../js/progression/achievements.js';
import { finishRound, selectMode, upgrades } from '../../js/game/progression.js';
import { loadSave } from '../../js/save.js';
import { createWorld } from '../../js/state.js';

export function runProgressionCases() {
	return [
		checkSaveMigration(),
		checkAchievementUnlock(),
		checkModeRecord(),
		checkReverseObjective()
	];
}

function checkSaveMigration() {
	const original = globalThis.localStorage;
	globalThis.localStorage = {
		getItem: () => JSON.stringify({ best: 99, stars: { malchus: 2 }, perf: 'low' })
	};
	const save = loadSave();
	if (original === undefined) delete globalThis.localStorage;
	else globalThis.localStorage = original;
	assert.equal(save.best, 99);
	assert.equal(save.stars.malchus, 2);
	assert.equal(save.selectedMode, 'classic');
	assert.deepEqual(save.modeRecords, {});
	assert.deepEqual(save.achievements, {});
	return { test: 'save-migration', selectedMode: save.selectedMode, perf: save.perf };
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
	return { test: 'mode-record', plays: record.plays, wins: record.wins, bestMass: record.bestMass };
}

function checkReverseObjective() {
	const world = createWorld();
	selectMode(world, 'reverse');
	world.consumed.landmark = 3;
	upgrades(world);
	assert.equal(world.objectiveMet, true);
	return { test: 'reverse-objective', mass: world.player.mass, landmarks: world.consumed.landmark };
}
