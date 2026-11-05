// B"H
import assert from 'node:assert/strict';
import { LodTransitionQueue } from '../../lod/LodTransitionQueue.js';

const queue = new LodTransitionQueue();
const applied = [];

assert.equal(queue.enqueue({ id: '', apply() {} }), false);
assert.equal(queue.enqueue({ id: 'low', priority: 1, cost: 1, apply: () => applied.push('low') }), true);
assert.equal(queue.enqueue({ id: 'high', priority: 9, cost: 2, apply: () => applied.push('high') }), true);
assert.equal(queue.enqueue({ id: 'middle', priority: 5, cost: 2, apply: () => applied.push('middle') }), true);
assert.equal(queue.size, 3);

const first = queue.process({ maximumTransitions: 2, maximumCost: 3 });
assert.deepEqual(applied, ['high', 'low']);
assert.equal(first.usedCost, 3);
assert.equal(first.remaining, 1);
assert.equal(queue.size, 1);

queue.enqueue({
	id: 'middle',
	priority: 12,
	cost: 1,
	apply: () => applied.push('middle-replaced')
});
assert.equal(queue.stats.replaced, 1);

queue.enqueue({
	id: 'failure',
	priority: 20,
	cost: 1,
	apply() { throw new Error('expected failure'); }
});
const second = queue.process({ maximumTransitions: 3, maximumCost: 5 });
assert.equal(second.results[0].ok, false);
assert.equal(second.results[1].ok, true);
assert.deepEqual(applied, ['high', 'low', 'middle-replaced']);
assert.equal(queue.stats.failed, 1);
assert.equal(queue.stats.applied, 3);
assert.equal(queue.size, 0);

queue.enqueue({ id: 'cancelled', apply: () => applied.push('never') });
assert.equal(queue.cancel('cancelled'), true);
queue.enqueue({ id: 'cleared', apply: () => applied.push('never') });
queue.clear();
assert.equal(queue.size, 0);

console.log(JSON.stringify({
	ok: true,
	applied,
	stats: queue.stats,
	first,
	second: {
		usedCost: second.usedCost,
		remaining: second.remaining,
		results: second.results.map((result) => ({ id: result.id, ok: result.ok }))
	}
}, null, 2));
