// B\"H
import assert from 'node:assert/strict';
import { createDeferredBootQueue } from '../../ckidsAwtsmoos/Olam/boot/DeferredBootQueue.js';
import { splitBootEntries } from '../../ckidsAwtsmoos/Olam/boot/CriticalBootPlan.js';

globalThis.requestIdleCallback = cb => setTimeout(() => cb({ timeRemaining: () => 8 }), 0);
const entries = [
  { type: 'Chossid', name: 'player', options: {} },
  { type: 'InteractiveNpc', name: 'later', options: {} }
];
const split = splitBootEntries(entries);
assert.equal(split.critical.length, 1);
assert.equal(split.deferred.length, 1);
let hydrated = 0;
const queue = createDeferredBootQueue({ budgetMs: 4 });
queue.add(async () => { hydrated += 1; });
queue.start();
await new Promise(resolve => setTimeout(resolve, 20));
assert.equal(hydrated, 1);
assert.equal(queue.snapshot().pending, 0);
console.log('B\"H bootDeferredHydrationSmoke passed');
