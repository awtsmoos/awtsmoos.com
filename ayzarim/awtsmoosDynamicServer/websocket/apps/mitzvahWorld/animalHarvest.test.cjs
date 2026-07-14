// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file animalHarvest.test.cjs
 * @description Proves animal care and abstract kosher-eligible resource harvesting.
 * The Awtsmoos renews pastoral life with dignity; Awtsmoos.com verifies distinct care,
 * explicit eligible intent, designated tools, bounded drops, and non-kosher denial.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('three cared animals and one eligible harvest complete two adventures', async () => {
	let now = 2_000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('animal-care-player');
	const joined = await flow.join('Pasture Shliach');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);

	await flow.send('adventure.start', { questId: 'shepherds-mercy' });
	for (const creatureId of ['sheep-1', 'sheep-2', 'goat-1']) {
		const creature = room.creatures.get(creatureId);
		player.position = beside(creature.position);
		await flow.send('creature.care', { creatureId });
	}
	assert.equal(
		(await flow.send('adventure.snapshot', { questId: 'shepherds-mercy' })).payload.progress.status,
		'complete'
	);

	await flow.send('adventure.start', { questId: 'kosher-provision' });
	const sheep = room.creatures.get('sheep-1');
	player.position = beside(sheep.position);
	while (sheep.status === 'active') {
		await flow.send('combat.attack', {
			creatureId: sheep.id,
			intent: 'harvest',
			weaponId: 'chalaf'
		});
		now += 901;
	}
	assert.equal(sheep.status, 'harvestable');
	const harvested = await flow.send('harvest.perform', { creatureId: sheep.id });
	assert.equal(harvested.payload.method, 'abstract-kosher-harvest');
	assert.equal(quantity(harvested.payload.state, 'kosher-meat'), 2);
	assert.equal(quantity(harvested.payload.state, 'prepared-hide'), 1);
	assert.equal(
		(await flow.send('adventure.snapshot', { questId: 'kosher-provision' })).payload.progress.status,
		'complete'
	);

	const chicken = room.creatures.get('chicken-1');
	player.position = beside(chicken.position);
	const denied = await flow.send('combat.attack', {
		creatureId: chicken.id,
		intent: 'harvest',
		weaponId: 'chalaf'
	});
	assert.equal(denied.type, 'error');
	assert.equal(denied.payload.code, 'ANIMAL_ATTACK_DENIED');
});

function beside(position) {
	return { x: position.x + 1, y: position.y, z: position.z };
}

function quantity(state, itemId) {
	return state.inventory.find(item => item.itemId === itemId)?.quantity || 0;
}
