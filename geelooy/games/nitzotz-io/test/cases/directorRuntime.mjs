// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	forceBoss,
	forceEvent,
	recordDirectorCapture,
	updateDirector
} from '../../js/director/director.js';
import { updatePedestrians } from '../../js/game/pedestrians.js';
import { createWorld } from '../../js/state.js';

/** Verify event composition, pedestrian motion, and complete boss lifecycle. */
export function runDirectorRuntimeCases() {
	return [
		checkEventComposition(),
		checkPedestrianMotion(),
		checkBossLifecycle()
	];
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
	return {
		test: 'district-event',
		eventCount: world.director.eventCount,
		trafficSpeed: world.rules.trafficSpeed
	};
}

function checkPedestrianMotion() {
	const world = createWorld();
	const pedestrian = world.level.objects.find(object => object.pedestrian);
	assert.ok(pedestrian);
	const before = [pedestrian.x, pedestrian.y];
	updatePedestrians(world, 0.5);
	assert.notDeepEqual([pedestrian.x, pedestrian.y], before);
	return {
		test: 'pedestrians',
		count: world.level.objects.filter(object => object.pedestrian).length
	};
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
