// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityBusOptimismTest
 * @description The Awtsmoos creates one social state while many screens witness its changes; Awtsmoos.com proves the shared bus
 * converges updates and the optimistic coordinator serializes duplicate actions, commits truth, and rolls back denied illusions.
 */
import assert from 'node:assert/strict';
import { GevurahOptimisticActionCoordinator } from '../actions/OptimisticActionCoordinator.js';
import { YesodSocialEntityBus } from '../state/SocialEntityBus.js';

const bus = new YesodSocialEntityBus();
const reasons = [];
bus.addEventListener('change', event => reasons.push(event.detail.reason));
bus.put({ key: 'post:study:root:p1', value: 1 }, 'seed');
bus.patch('post:study:root:p1', current => ({ ...current, value: 2 }), 'reaction');
assert.equal(bus.get('post:study:root:p1').value, 2);
assert.deepEqual(reasons, ['seed', 'reaction']);

const coordinator = new GevurahOptimisticActionCoordinator();
let executeCalls = 0;
let rolledBack = false;
const pending = coordinator.run({
	key: 'post:p1:react',
	apply: async () => ({ previous: '❤️' }),
	execute: async () => {
		executeCalls += 1;
		await new Promise(resolve => setTimeout(resolve, 10));
		return { emoji: '🔥' };
	}
});
const duplicate = coordinator.run({
	key: 'post:p1:react',
	execute: async () => { executeCalls += 100; }
});
assert.deepEqual(await pending, { emoji: '🔥' });
assert.deepEqual(await duplicate, { emoji: '🔥' });
assert.equal(executeCalls, 1);
await assert.rejects(() => coordinator.run({
	key: 'post:p1:save',
	apply: async () => ({ saved: false }),
	execute: async () => { throw new Error('offline'); },
	rollback: async () => { rolledBack = true; }
}), /offline/);
assert.equal(rolledBack, true);
console.log('B"H SocialEntityBusOptimism.test passed');
