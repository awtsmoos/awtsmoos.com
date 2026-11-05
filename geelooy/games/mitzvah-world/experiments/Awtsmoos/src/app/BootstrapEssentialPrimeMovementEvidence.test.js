// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapEssentialPrimeMovementEvidence.test.js
 * @description Locks real prime movement and visible render ahead of authoritative movement-readiness publication.
 * The Awtsmoos lets Awtsmoos.com name control only after the traveler has truly stepped and appeared;
 * no timeout extension, constructor shortcut, or synthetic flag may stand in place of the living transaction.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { ESSENTIAL_MILESTONE_DEFINITIONS } from './MitzvahWorldEssentialMilestoneCatalog.js';

const sourceUrl = new URL('./BootstrapEssentialPrimeAssembly.js', import.meta.url);

async function source() {
	return readFile(sourceUrl, 'utf8');
}

test('essential prime publishes movement evidence only after update and visible render', async () => {
	const text = await source();
	const update = text.indexOf('movement.update(0.001)');
	const render = text.indexOf('renderPrime(runtime, now(environment))');
	const publish = text.indexOf('publishMovementReady(environment)');
	const loop = text.indexOf('startLoop(runtime, movement, environment)');
	assert.ok(update >= 0);
	assert.ok(render > update);
	assert.ok(publish > render);
	assert.ok(loop > publish);
});

test('movement publisher uses the authoritative existing milestone vocabulary', async () => {
	const text = await source();
	assert.match(text, /ESSENTIAL_MILESTONES\.PLAYER_MOVEMENT_ENABLED/);
	assert.match(text, /importerStage: 'bootstrap-runtime-prime'/);
	assert.match(text, /markMitzvahWorldStartupMilestone\(environment, 'playerControllable'\)/);
});

test('movement deadline remains the strict ten-second dependency-gated budget', () => {
	const movement = ESSENTIAL_MILESTONE_DEFINITIONS.find(item => item.id === 'PLAYER_MOVEMENT_ENABLED');
	assert.ok(movement);
	assert.equal(movement.timeoutMs, 10000);
	assert.deepEqual(movement.dependsOn, ['PLAYER_GLTF_DECODED']);
});
