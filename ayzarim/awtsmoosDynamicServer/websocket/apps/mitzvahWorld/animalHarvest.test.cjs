// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animalHarvest.test.cjs
 * @description Proves animal care and timed kosher-eligible resource harvesting.
 * The Awtsmoos renews pastoral life with dignity; Awtsmoos.com verifies distinct care,
 * explicit eligible intent, active tool windows, facing, unique impacts, and non-kosher denial.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('three cared animals and one eligible harvest complete two adventures', async () => {
	let now = 2_000;
	let impact = 0;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('animal-care-player');
	const joined = await flow.join('Pasture Shliach');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	await flow.send('adventure.start', { questId: 'shepherds-mercy' });
	for (const creatureId of ['sheep-1', 'sheep-2', 'goat-1']) {
		const creature = room.creatures.get(creatureId);
		placeFacing(player, creature.position);
		await flow.send('creature.care', { creatureId });
	}
	assert.equal(
		(await adventure(flow, 'shepherds-mercy')).payload.adventure.progress.status,
		'complete'
	);
	await flow.send('adventure.start', { questId: 'kosher-provision' });
	const sheep = room.creatures.get('sheep-1');
	placeFacing(player, sheep.position);
	while (sheep.status === 'active') {
		impact += 1;
		const response = await flow.send(
			'combat.attack',
			harvestAttack(sheep.id, impact)
		);
		assert.notEqual(response.type, 'error');
		now += 901;
	}
	assert.equal(sheep.status, 'harvestable');
	const harvested = await flow.send('harvest.perform', { creatureId: sheep.id });
	assert.equal(harvested.payload.method, 'abstract-kosher-harvest');
	assert.equal(quantity(harvested.payload.state, 'kosher-meat'), 2);
	assert.equal(quantity(harvested.payload.state, 'prepared-hide'), 1);
	assert.equal(
		(await adventure(flow, 'kosher-provision')).payload.adventure.progress.status,
		'complete'
	);
	const chicken = room.creatures.get('chicken-1');
	placeFacing(player, chicken.position);
	const denied = await flow.send(
		'combat.attack',
		harvestAttack(chicken.id, ++impact)
	);
	assert.equal(denied.type, 'error');
	assert.equal(denied.payload.code, 'ANIMAL_ATTACK_DENIED');
});

function harvestAttack(creatureId, impact) {
	return {
		actionId: 'chalaf-harvest',
		creatureId,
		elapsedSeconds: 0.3,
		impactToken: `harvest:${impact}`,
		intent: 'harvest',
		weaponId: 'chalaf'
	};
}

function adventure(flow, questId) {
	return flow.send('adventure.snapshot', { questId });
}

function placeFacing(player, position) {
	player.position = { x: position.x, y: position.y, z: position.z - 1 };
	player.facing = 0;
}

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
