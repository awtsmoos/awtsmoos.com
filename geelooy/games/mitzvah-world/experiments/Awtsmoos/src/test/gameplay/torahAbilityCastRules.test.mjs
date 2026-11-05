// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityCastRules.test.mjs @description Verifies deterministic cast-state math. */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	abilityCastSnapshot,
	abilityChargeRatio,
	channelTickPlan,
	createAbilityCast
} from '../../gameplay/combat/TorahAbilityCastRules.js';
import { torahAbilityDefinition } from '../../gameplay/combat/TorahAbilityCatalog.js';

test('charged casts expose bounded progress and release strength', () => {
	const cast = createAbilityCast(torahAbilityDefinition('joy-breaks-barriers'), {}, 100, 'cast-1');
	assert.equal(cast.phase, 'charging');
	assert.equal(abilityChargeRatio(cast, 100), 0.1);
	assert.equal(abilityChargeRatio(cast, 800), 0.5);
	assert.equal(abilityChargeRatio(cast, 2000), 1);
	assert.equal(abilityCastSnapshot(cast, 800).progress, 0.5);
});

test('channel tick plan produces exactly three bounded ticks', () => {
	const cast = createAbilityCast(torahAbilityDefinition('voice-of-unity'), {}, 0, 'cast-2');
	assert.deepEqual(channelTickPlan(cast, 799), null);
	assert.deepEqual(channelTickPlan(cast, 800), { count: 1, firstTickIndex: 1 });
	assert.deepEqual(channelTickPlan(cast, 2400), { count: 2, firstTickIndex: 2 });
	assert.deepEqual(channelTickPlan(cast, 4000), { count: 0, firstTickIndex: 4 });
});
