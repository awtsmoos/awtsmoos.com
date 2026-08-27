// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shliachProfile.test.cjs
 * @description Proves private attributes, equipment-derived stats, powerups, privacy, and rewards.
 * The Awtsmoos renews growth beneath one replay-safe covenant; Awtsmoos.com verifies that
 * equipment contributes once while Perutas and inner attributes never leak into public truth.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createPlayer, snapshotPlayer } = require('./PlayerEntity.js');
const { handlePlayerProfileRequest } = require('./PlayerProfileRequest.js');
const { grantReward } = require('./Progression.js');
const { ShliachProfileService } = require('./ShliachProfileService.js');

function player() {
	return createPlayer({ displayName: 'Test Shliach', id: 'player-test' });
}

test('new players receive seven private attributes, three points, and equipped power', () => {
	const value = player();
	assert.deepEqual(value.shliach.attributes, {
		binah: 1,
		chochmah: 1,
		daas: 1,
		gevurah: 1,
		haganah: 1,
		malchus: 1,
		zeirAnpin: 1
	});
	assert.equal(value.shliach.unspentPoints, 3);
	const publicValue = snapshotPlayer(value);
	assert.equal(publicValue.shliach.powerRating, 86);
	assert.equal(publicValue.shliach.attributes, undefined);
	assert.equal(publicValue.wallet, undefined);
});

test('allocation changes derived stats without exposing private state', () => {
	const value = player();
	const service = new ShliachProfileService();
	const result = service.allocate(value, 'gevurah', 2);
	assert.equal(result.attributes.gevurah, 3);
	assert.equal(result.unspentPoints, 1);
	assert.equal(result.derived.damageBonus, 24);
	assert.equal(result.derived.diagnostics.duplicateSourceIds.length, 0);
	assert.throws(
		() => service.allocate(value, 'binah', 2),
		error => error.code === 'ATTRIBUTE_POINTS_UNAVAILABLE'
	);
});

test('powerups spend Perutas, apply effects, and expire by server time', () => {
	let now = 1000;
	const value = player();
	const service = new ShliachProfileService({ clock: () => now });
	const active = service.activate(value, 'haganah-aura');
	assert.equal(active.perutas, 70);
	assert.equal(active.derived.armor, 21);
	assert.equal(active.activePowerups['haganah-aura'].expiresAt, 36000);
	now = 36001;
	const expired = service.snapshot(value);
	assert.deepEqual(expired.activePowerups, {});
	assert.equal(expired.derived.armor, 3);
});

test('profile route keeps allocation private and status update public', () => {
	const value = player();
	const service = new ShliachProfileService();
	const room = {
		playerActions: {
			profile(target, update) {
				if (update) Object.assign(target.profile, update);
				return { ...target.profile };
			}
		},
		profiles: service,
		record() {}
	};
	const allocation = handlePlayerProfileRequest(room, value, {
		attributeId: 'chochmah',
		operation: 'allocate',
		points: 1
	});
	assert.equal(allocation.broadcast, false);
	assert.equal(allocation.checkpoint, true);
	const update = handlePlayerProfileRequest(room, value, {
		operation: 'update',
		status: 'adventuring'
	});
	assert.equal(update.broadcast, true);
	assert.equal(value.profile.status, 'adventuring');
});

test('reward replay cannot duplicate XP, points, or Perutas', () => {
	const value = player();
	const reward = { id: 'reward-one', mitzvahPoints: 5, perutas: 21, xp: 400 };
	assert.equal(grantReward(value.progression, reward, value), true);
	assert.equal(value.progression.level, 3);
	assert.equal(value.shliach.unspentPoints, 7);
	assert.equal(value.wallet.mitzvahCoins, 121);
	assert.equal(grantReward(value.progression, reward, value), false);
	assert.equal(value.wallet.mitzvahCoins, 121);
});
