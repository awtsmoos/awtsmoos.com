import assert from 'node:assert/strict';
import { PassageUnlockRuntime } from '../ckidsAwtsmoos/Olam/runtime/chumash/PassageUnlockRuntime.js';

const unlocks = new PassageUnlockRuntime(['bereishis_1_1']);
assert.equal(unlocks.has('bereishis_1_1'), true);
assert.deepEqual(unlocks.unlock('shemos_20_2', 'debate'), { passageId: 'shemos_20_2', source: 'debate' });
assert.deepEqual(unlocks.unlock('shemos_20_2', 'quest'), { passageId: 'shemos_20_2', source: 'debate' });
assert.equal(unlocks.list().length, 2);
assert.throws(() => unlocks.unlock(''), /Passage id is required/);

console.log('B"H passage unlock passed');
