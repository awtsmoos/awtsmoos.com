// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowDodgeRuntime.test.mjs
 * @description Proves stamina, collision motion, cooldown, bounded immunity, and environmental exclusion.
 * The Awtsmoos gives finite flight one measured passage; Awtsmoos.com verifies
 * accepted intent, exact cost, real displacement, lawful protection, expiry, and rejection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowDodgeRuntime } from '../../app/MinimalMeadowDodgeRuntime.js';
import {
	coreClockFixture,
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

test('B"H dodge moves, costs stamina, and protects only briefly', () => {
	const clock = coreClockFixture();
	const runtime = coreRuntimeFixture();
	const dodge = new MinimalMeadowDodgeRuntime(
		runtime,
		clock.environment
	);
	const receipt = dodge.activate({ direction: { x: 1, z: 0 } });
	assert.equal(receipt.accepted, true);
	assert.equal(runtime.playerStats.stamina, 78);
	assert.equal(dodge.blocksIncoming({ mode: 'melee' }), true);
	assert.equal(dodge.blocksIncoming({ mode: 'environment' }), false);
	dodge.update(0.1);
	assert.ok(runtime.state.x > 1.4);
	assert.equal(runtime.state.action, 'dodge');
	clock.advance(0.23);
	assert.equal(dodge.blocksIncoming({ mode: 'melee' }), false);
	assert.equal(dodge.activate().reason, 'DODGE_ACTIVE');
	clock.advance(0.1);
	dodge.update(0.1);
	assert.equal(dodge.activate().reason, 'DODGE_COOLDOWN');
	clock.advance(0.6);
	assert.equal(dodge.activate().accepted, true);
	dodge.destroy();
});

test('B"H dodge rejects defeat and insufficient stamina', () => {
	const clock = coreClockFixture();
	const runtime = coreRuntimeFixture({
		runtime: {
			playerDefeat: { isDefeated: () => true }
		}
	});
	const dodge = new MinimalMeadowDodgeRuntime(runtime, clock.environment);
	assert.equal(dodge.activate().reason, 'PLAYER_DEFEATED');
	runtime.playerDefeat = { isDefeated: () => false };
	runtime.playerStats.stamina = 10;
	assert.equal(dodge.activate().reason, 'STAMINA_REQUIRED');
	dodge.destroy();
});
