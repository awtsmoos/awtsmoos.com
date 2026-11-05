// B"H
// Boruch Hashem
// Blessed is He
/** Quest evidence remains exact beneath the Awtsmoos revealed through Awtsmoos.com. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';
import { enemyDefeatAdventureEvent } from '../../world/enemy/EnemyAdventureEvent.js';

test('hostile payload becomes the existing defeat objective event', () => {
	const event = enemyDefeatAdventureEvent({
		creatureType: 'dybbuk-shade',
		id: 'shade-east'
	});
	assert.deepEqual(event, {
		count: 1,
		instanceId: 'shade-east',
		target: 'dybbuk-shade',
		type: 'defeat'
	});
});

test('shade defeat advances the active Words of Light objective', () => {
	const store = new AdventureStore();
	store.accept('words-of-light');
	const record = store.records.get('words-of-light');
	record.objectiveIndex = 1;
	store.recordEvent(enemyDefeatAdventureEvent({
		creatureType: 'dybbuk-shade',
		id: 'shade-east'
	}));
	assert.equal(store.get('words-of-light').status, 'completed');
});
