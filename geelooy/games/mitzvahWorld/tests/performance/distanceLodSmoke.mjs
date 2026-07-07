// B\"H
import assert from 'node:assert/strict';
import { createNivraSpawnBudget } from '../../ckidsAwtsmoos/Olam/world/streaming/NivraSpawnBudget.js';

const budget = createNivraSpawnBudget({ perFrame: 2, maxQueued: 4 });
const queue = [1, 2, 3];
assert.deepEqual(budget.nextBatch(queue), [1, 2]);
assert.deepEqual(queue, [3]);
assert.equal(budget.canAccept(3), true);
assert.equal(budget.canAccept(4), false);
console.log('B\"H distanceLodSmoke passed');
