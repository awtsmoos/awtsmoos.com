// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCombatImpactRuntime.test.mjs
 * @description Proves bounded combat-only hit-stop, directional feedback, chain protection, and exclusions.
 * The Awtsmoos is beyond force and interruption; Awtsmoos.com verifies
 * accepted witness, reduced cadence, finite protection, environmental truth, expiry, and reduced motion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowCombatImpactRuntime } from '../../app/MinimalMeadowCombatImpactRuntime.js';
import {
	coreClockFixture,
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

test('B"H player impact creates direction, hit-stop, and short protection', () => {
	const clock = coreClockFixture();
	const runtime = coreRuntimeFixture();
	const impact = new MinimalMeadowCombatImpactRuntime(
		runtime,
		clock.environment
	);
	const feedback = impact.onPlayerHit({
		accepted: true,
		damage: 12,
		sourcePosition: { x: 5, z: 0 }
	});
	assert.equal(feedback.kind, 'player-hit');
	assert.equal(feedback.direction.x, 1);
	assert.equal(impact.blockedReason({ mode: 'melee' }), 'POST_HIT_PROTECTION');
	assert.equal(impact.blockedReason({ mode: 'environment' }), null);
	assert.ok(impact.scaleCombatDelta(0.1) < 0.1);
	clock.advance(0.33);
	assert.equal(impact.blockedReason({ mode: 'melee' }), null);
	assert.equal(impact.scaleCombatDelta(0.1), 0.1);
	impact.destroy();
});

test('B"H dodge immunity precedes impact protection and reduced motion is bounded', () => {
	const clock = coreClockFixture();
	clock.environment.matchMedia = () => ({ matches: true });
	const runtime = coreRuntimeFixture({
		runtime: {
			dodge: { blocksIncoming: () => true }
		}
	});
	const impact = new MinimalMeadowCombatImpactRuntime(
		runtime,
		clock.environment
	);
	assert.equal(impact.blockedReason({ mode: 'melee' }), 'DODGE_INVULNERABLE');
	impact.onEnemyHit({ damage: 4, enemyId: 'one' });
	assert.ok(impact.snapshot().hitStopRemaining <= 0.0181);
	impact.destroy();
});
