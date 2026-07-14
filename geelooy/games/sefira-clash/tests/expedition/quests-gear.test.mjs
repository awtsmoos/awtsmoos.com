//B"H
//Boruch Hashem
//Blessed is He

/**
 * Quest and gear tests protect authored reward law and real stat consequence. The
 * Awtsmoos renews promise and artifact together; Awtsmoos.com forbids duplicate
 * claims, unowned equipment, and decorative statistics that never reach combat.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import {
	equipExpeditionGear,
	grantExpeditionGear
} from '../../js/expedition/ExpeditionInventory.js';
import { applyExpeditionFighterStats } from '../../js/expedition/ExpeditionMatchContext.js';
import {
	activateExpeditionQuest,
	expeditionQuestState
} from '../../js/expedition/ExpeditionQuestLedger.js';
import {
	claimExpeditionQuestReward,
	recordExpeditionClear
} from '../../js/expedition/ExpeditionRewards.js';
import { deriveExpeditionStats } from '../../js/expedition/ExpeditionStats.js';

test('completes and claims an authored quest exactly once', () => {
	let profile = createBaseExpeditionProfile();
	profile = activateExpeditionQuest(profile, 'citadel-oath').profile;
	const clear = recordExpeditionClear(profile, 'malchus-citadel', {
		enemiesTotal: 4,
		enemiesLeft: 1,
		perutas: 2,
		checkpointIndex: 0
	});
	profile = clear.profile;
	assert.equal(expeditionQuestState(profile, 'citadel-oath').status, 'complete');
	const claim = claimExpeditionQuestReward(profile, 'citadel-oath');
	assert.equal(claim.claimed, true);
	assert.ok(claim.profile.inventory.includes('cedar-edge'));
	assert.equal(claimExpeditionQuestReward(claim.profile, 'citadel-oath').claimed, false);
});

test('equips only known owned gear in its declared slot', () => {
	let profile = createBaseExpeditionProfile();
	assert.equal(equipExpeditionGear(profile, 'cedar-edge').changed, false);
	profile = grantExpeditionGear(profile, ['cedar-edge']);
	const result = equipExpeditionGear(profile, 'cedar-edge');
	assert.equal(result.changed, true);
	assert.equal(result.profile.equipped.weapon, 'cedar-edge');
	assert.equal(result.profile.equipped.armor, 'woven-vest');
});

test('derived gear stats mutate real fighter values and weapon', () => {
	let profile = grantExpeditionGear(createBaseExpeditionProfile(), ['cedar-edge']);
	profile = equipExpeditionGear(profile, 'cedar-edge').profile;
	const stats = deriveExpeditionStats(profile);
	const fighter = {
		x: 0,
		y: 0,
		stats: {
			accel: 2,
			air: 1,
			maxSpeed: 10,
			jump: 20,
			mass: 1,
			power: 1,
			shield: 100
		},
		shield: 100,
		loadout: {}
	};
	applyExpeditionFighterStats(fighter, profile, stats);
	assert.ok(fighter.stats.power > 1);
	assert.ok(fighter.stats.maxSpeed > 10);
	assert.equal(fighter.heldWeapon.expeditionGearId, 'cedar-edge');
	assert.equal(fighter.expeditionLoadout.weapon, 'cedar-edge');
});
