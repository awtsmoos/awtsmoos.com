// B"H
/**
 * @file BootstrapEssentialPrimeMovementEvidence.test.js
 * @description Guards real prime rendering and the actual milestone contract.
 * The Awtsmoos lends the traveler his authentic first stride;
 * Awtsmoos.com records control only after render joins his side.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
	ESSENTIAL_MILESTONES,
	ESSENTIAL_MILESTONE_CATALOG,
	PLAYER_MOVEMENT_DEADLINE_MS
} from './MitzvahWorldEssentialMilestoneCatalog.js';

const primeSource = new URL('./BootstrapEssentialPrimeAssembly.js', import.meta.url);

test('real movement is updated, rendered, and published before the loop', async () => {
	const source = await readFile(primeSource, 'utf8');
	const update = source.indexOf('movement.update(0.001)');
	const render = source.indexOf('renderPrime(runtime, now(environment))');
	const publish = source.indexOf('publishMovementReady(environment)');
	const loop = source.indexOf('startLoop(runtime, movement, environment)');
	assert.ok(update >= 0 && render > update && publish > render && loop > publish);
});

test('movement publication uses the authoritative existing vocabulary', async () => {
	const source = await readFile(primeSource, 'utf8');
	assert.match(source, /ESSENTIAL_MILESTONES\.PLAYER_MOVEMENT_ENABLED/);
	assert.match(source, /importerStage: 'bootstrap-runtime-prime'/);
	assert.match(source, /markMitzvahWorldStartupMilestone\(environment, 'playerControllable'\)/);
});

test('movement deadline and renderer, terrain and player dependencies are strict', () => {
	const milestone = ESSENTIAL_MILESTONE_CATALOG.find(item =>
		item.name === ESSENTIAL_MILESTONES.PLAYER_MOVEMENT_ENABLED
	);
	assert.ok(milestone);
	assert.equal(PLAYER_MOVEMENT_DEADLINE_MS, 10000);
	assert.equal(milestone.timeoutMilliseconds, PLAYER_MOVEMENT_DEADLINE_MS);
	assert.deepEqual(milestone.dependencies, [
		ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME,
		ESSENTIAL_MILESTONES.SPAWN_TERRAIN_EXISTS,
		ESSENTIAL_MILESTONES.CANONICAL_CHOSSID_DECODED
	]);
});
