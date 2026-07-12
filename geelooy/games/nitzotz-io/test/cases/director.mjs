// B"H
import assert from 'node:assert/strict';
import { forceBoss, forceEvent, recordDirectorCapture, updateDirector } from '../../js/director/director.js';
import { updatePedestrians } from '../../js/game/pedestrians.js';
import { selectMode } from '../../js/game/progression.js';
import { archetypeFor } from '../../js/game/rivalStrategies.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { MODES } from '../../js/modes/catalog.js';
import { dailySeed, dailyVariant } from '../../js/modes/daily.js';
import { createWorld } from '../../js/state.js';

export function runDirectorCases() {
	return [
		checkModeCatalog(),
		checkZenRules(),
		checkDailyDeterminism(),
		checkRivalArchetypes(),
		checkEventComposition(),
		checkPedestrianMotion(),
		checkBossLifecycle()
	];
}

function checkModeCatalog() {
	assert.equal(MODES.length, 12);
	assert.equal(new Set(MODES.map(mode => mode.id)).size, MODES.length);
	assert.ok(MODES.every(mode => mode.name && mode.description));
	return { test: 'mode-catalog', modes: MODES.map(mode => mode.id) };
}

function checkZenRules() {
	const world = createWorld();
	selectMode(world, 'zen');
	assert.equal(world.gameMode.id, 'zen');
	assert.equal(world.rivals.length, 0);
	assert.equal(world.timeLeft, Infinity);
	assert.equal(world.gameMode.events, false);
	return { test: 'zen-rules', rivals: world.rivals.length, untimed: !Number.isFinite(world.timeLeft) };
}

function checkDailyDeterminism() {
	const firstDate = new Date(2026, 6, 12);
	const secondDate = new Date(2026, 6, 13);
	assert.equal(dailySeed(412, firstDate), dailySeed(412, firstDate));
	assert.notEqual(dailySeed(412, firstDate), dailySeed(412, secondDate));
	assert.equal(dailyVariant(firstDate).name, dailyVariant(firstDate).name);
	return { test: 'daily-determinism', seed: dailySeed(412, firstDate), variant: dailyVariant(firstDate).name };
}

function checkRivalArchetypes() {
	const identities = new Set();
	for (const level of LEVELS) {
		for (let index = 0; index < 7; index += 1) identities.add(archetypeFor(level, index).id);
	}
	assert.equal(identities.size, 7);
	return { test: 'rival-archetypes', identities: [...identities].sort() };
}

function checkEventComposition() {
	const world = createWorld();
	forceEvent(world, 'trafficSurge');
	updateDirector(world, 0);
	assert.equal(world.director.event.id, 'trafficSurge');
	assert.equal(world.rules.trafficSpeed, 1.9);
	updateDirector(world, 10);
	assert.equal(world.director.event, null);
	assert.equal(world.rules.trafficSpeed, world.gameMode.trafficSpeed);
	return { test: 'district-event', eventCount: world.director.eventCount, trafficSpeed: world.rules.trafficSpeed };
}

function checkPedestrianMotion() {
	const world = createWorld();
	const pedestrian = world.level.objects.find(object => object.pedestrian);
	assert.ok(pedestrian);
	const before = [pedestrian.x, pedestrian.y];
	updatePedestrians(world, 0.5);
	assert.notDeepEqual([pedestrian.x, pedestrian.y], before);
	return { test: 'pedestrians', count: world.level.objects.filter(object => object.pedestrian).length };
}

function checkBossLifecycle() {
	const world = createWorld();
	const boss = forceBoss(world);
	assert.equal(boss.status, 'shielded');
	assert.equal(boss.anchorIds.length, 3);
	for (const id of boss.anchorIds) {
		const anchor = world.level.objects.find(object => object.id === id);
		anchor.taken = true;
		recordDirectorCapture(world, anchor);
	}
	assert.equal(boss.status, 'exposed');
	const core = world.level.objects.find(object => object.id === boss.coreId);
	assert.equal(core.locked, false);
	core.taken = true;
	recordDirectorCapture(world, core);
	assert.equal(boss.status, 'defeated');
	assert.equal(world.telemetry.bosses, 1);
	return { test: 'boss-lifecycle', name: boss.name, stages: boss.stage, score: world.score };
}
