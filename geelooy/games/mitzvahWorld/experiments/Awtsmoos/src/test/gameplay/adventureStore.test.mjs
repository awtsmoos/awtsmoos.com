// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file adventureStore.test.mjs
 * @description Proves offer choice, pin bounds, objective progress, completion, and reset.
 * The Awtsmoos renews every shlichus through free acceptance and measured action;
 * Awtsmoos.com keeps local presentation deterministic while shared authority remains server-side.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../../gameplay/AdventureStore.js';

const WOOD = 'wood-for-the-shul';
const FLOWERS = 'flowers-for-shabbos';

test('quest offer can be declined and later accepted', () => {
	const store = new AdventureStore();
	assert.equal(store.offer(WOOD).status, 'offered');
	assert.equal(store.decline(WOOD).status, 'declined');
	assert.equal(store.accept(WOOD).status, 'active');
	assert.equal(store.snapshot().active.length, 1);
});

test('sequential objectives progress only on matching events', () => {
	const store = new AdventureStore();
	store.accept(WOOD);
	store.recordEvent({ count: 1, target: 'fallen-wood', type: 'chop' });
	assert.equal(store.get(WOOD).objectiveIndex, 0);
	store.recordEvent({ count: 1, target: 'forest-axe', type: 'purchase' });
	assert.equal(store.get(WOOD).objectiveIndex, 1);
	store.recordEvent({ count: 5, target: 'fallen-wood', type: 'chop' });
	assert.equal(store.get(WOOD).objectives[1].progress, 5);
	store.recordEvent({ count: 1, target: 'fallen-wood', type: 'chop' });
	assert.equal(store.get(WOOD).status, 'completed');
});

test('pinning is bounded and abandon resets progress', () => {
	const store = new AdventureStore();
	for (const questId of [WOOD, FLOWERS, 'lost-scroll-by-stream']) {
		store.accept(questId);
		store.togglePin(questId);
	}
	store.accept('forest-predator-patrol');
	assert.throws(
		() => store.togglePin('forest-predator-patrol'),
		/Only 3 quests/
	);
	store.recordEvent({ count: 2, target: 'cottage-flower', type: 'collect' });
	assert.equal(store.get(FLOWERS).objectives[0].progress, 2);
	store.abandon(FLOWERS);
	assert.equal(store.get(FLOWERS).status, 'available');
	assert.equal(store.get(FLOWERS).objectives[0].progress, 0);
});

test('custom catalogs remain valid store vessels', () => {
	const custom = [{
		description: 'Custom path.',
		giver: { id: 'guide', name: 'Guide', position: { x: 0, y: 0, z: 0 } },
		id: 'custom-path',
		name: 'Custom Path',
		objectives: [{ count: 1, description: 'Speak.', eventType: 'talk', marker: { x: 0, y: 0, z: 0 }, target: 'guide' }],
		reward: { mitzvahPoints: 1, xp: 1 }
	}];
	const store = new AdventureStore({ catalog: custom });
	assert.equal(store.accept('custom-path').status, 'active');
	store.recordEvent({ target: 'guide', type: 'talk' });
	assert.equal(store.get('custom-path').status, 'completed');
});
