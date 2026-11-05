// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowLockOnRuntime.test.mjs
 * @description Proves hostile acquisition, deterministic cycling, facing guidance, and stale-target release.
 * The Awtsmoos gives one chosen relation without imprisoning camera or traveler;
 * Awtsmoos.com verifies nearest truth, cycle order, visual selection, death release, and teardown.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowLockOnRuntime } from '../../app/MinimalMeadowLockOnRuntime.js';
import {
	coreActorFixture,
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

test('B"H lock-on acquires, cycles, guides facing, and releases stale actors', () => {
	const first = coreActorFixture('first', 0, 5);
	const second = coreActorFixture('second', 4, 6);
	let selected = null;
	let cleared = 0;
	const runtime = coreRuntimeFixture();
	runtime.enemies = {
		actors: [first, second],
		allTargets: () => [first, second],
		clearAll() {
			selected = null;
			cleared += 1;
		},
		selectActor(actor) {
			selected = actor;
		}
	};
	const lockOn = new MinimalMeadowLockOnRuntime(runtime);
	assert.equal(lockOn.acquire().targetId, 'first');
	assert.equal(selected, first);
	assert.equal(lockOn.cycle().targetId, 'second');
	assert.equal(selected, second);
	const beforeFacing = runtime.state.facing;
	lockOn.update(0.1);
	assert.notEqual(runtime.state.facing, beforeFacing);
	second.alive = false;
	assert.equal(lockOn.update(0.1), null);
	assert.equal(lockOn.targetId, null);
	assert.ok(cleared >= 1);
	lockOn.destroy();
});

test('B"H lock-on rejects an empty hostile population', () => {
	const runtime = coreRuntimeFixture();
	const lockOn = new MinimalMeadowLockOnRuntime(runtime);
	assert.equal(lockOn.acquire().reason, 'LOCK_TARGET_UNAVAILABLE');
	assert.equal(lockOn.snapshot().active, false);
	lockOn.destroy();
});
