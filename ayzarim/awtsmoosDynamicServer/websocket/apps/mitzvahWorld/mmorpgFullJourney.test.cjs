// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews the wilderness, reward, and kindly village street;
 * Awtsmoos.com proves earned treasure survives a new disk-backed server seat.
 * Every action follows the actual authoritative MMORPG request router.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');
const { createTokenFactory } = require('./sessionTestSupport.cjs');
const { createDiskJourneyFixture } = require('./mmorpgDiskJourneyFixture.cjs');

/**
 * Place and face a player within legitimate range of one hostile creature.
 * @param {object} player Authoritative player record.
 * @param {object} creature Authored world creature.
 */
function faceCreature(player, creature) {
	player.position = {
		x: creature.position.x + 1,
		y: creature.position.y,
		z: creature.position.z
	};
	player.facing = Math.atan2(
		creature.position.x - player.position.x,
		creature.position.z - player.position.z
	);
}

/**
 * Count the actual item quantity held by the authoritative player.
 * @param {object} player Player inventory owner.
 * @param {string} itemId Real item identifier.
 * @returns {number} Held count, or zero.
 */
function quantity(player, itemId) {
	return player.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}

test('hunting, loot, crafting and quest progress survive a disk-backed world replacement', async () => {
	const fixture = createDiskJourneyFixture();
	let now = 8_000;
	const options = {
		clock: () => now,
		gracePeriodMs: 10_000,
		persistence: fixture.open(),
		tokenFactory: createTokenFactory()
	};
	try {
		const first = createMmorpgHarness(options);
		const hunter = first.flow('journey-hunter');
		const joined = await hunter.join('Journey Shliach');
		const room = first.directory.rooms.get('main-village');
		const player = room.players.get(joined.payload.playerId);
		const creature = room.creatures.get('dybbuk-1');
		assert.ok(player && creature);
		assert.equal((await hunter.send('adventure.start', {
			questId: 'sparks-at-east-gate'
		})).type, 'adventure.started');
		faceCreature(player, creature);
		for (let impact = 1; creature.status === 'active' && impact <= 15; impact += 1) {
			const attack = await hunter.send('combat.attack', {
				actionId: 'staff-light',
				creatureId: creature.id,
				elapsedSeconds: 0.2,
				impactToken: `journey-impact-${impact}`,
				intent: 'defense',
				weaponId: 'wooden-staff'
			});
			assert.equal(attack.type, 'combat.attacked');
			now += 701;
		}
		assert.equal(creature.status, 'defeated');
		assert.equal(player.refinedSparks, 2);
		assert.equal(player.adventureQuests['sparks-at-east-gate'].count, 1);
		assert.equal((await hunter.send('loot.claim', {
			creatureId: creature.id
		})).type, 'loot.claimed');
		assert.equal(quantity(player, 'shadow-remnant'), 1);
		const replay = await hunter.send('loot.claim', { creatureId: creature.id });
		assert.equal(replay.payload.code, 'CORPSE_ALREADY_LOOTED');
		assert.equal((await hunter.send('vendor.buy', {
			itemId: 'wooden-token', quantity: 2
		})).type, 'vendor.bought');
		assert.equal((await hunter.send('vendor.buy', {
			itemId: 'wool-thread', quantity: 1
		})).type, 'vendor.bought');
		assert.equal((await hunter.send('craft.execute', {
			count: 1, recipeId: 'community-badge'
		})).type, 'craft.completed');
		assert.equal(quantity(player, 'community-badge'), 1);
		assert.equal(quantity(player, 'wooden-token'), 0);
		assert.equal(quantity(player, 'wool-thread'), 0);
		await first.platform.disconnect(hunter.client);
		fixture.verify();
		const second = createMmorpgHarness({ ...options, persistence: fixture.open() });
		const resumed = second.flow('journey-resume');
		const recovery = await resumed.send('world.join', {
			resumeToken: joined.payload.session.resumeToken
		});
		assert.equal(recovery.payload.playerId, joined.payload.playerId);
		const restored = second.directory.rooms.get('main-village');
		const restoredPlayer = restored.players.get(joined.payload.playerId);
		assert.equal(quantity(restoredPlayer, 'shadow-remnant'), 1);
		assert.equal(quantity(restoredPlayer, 'community-badge'), 1);
		assert.equal(restoredPlayer.refinedSparks, 2);
		assert.equal(restoredPlayer.adventureQuests['sparks-at-east-gate'].count, 1);
		assert.equal(restored.creatures.get(creature.id).lootClaimedBy, joined.payload.playerId);
	} finally {
		fixture.cleanup();
	}
});
