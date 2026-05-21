import assert from 'node:assert/strict';
import { DebateFxQueue, createDebateFxEvent } from '../ckidsAwtsmoos/Olam/runtime/debate/DebateFxRuntime.js';

assert.deepEqual(createDebateFxEvent({ type: 'pshat', strength: 'strong', targetId: 'claim_random_world' }), {
  kind: 'earthImpact',
  type: 'pshat',
  strength: 'strong',
  targetId: 'claim_random_world',
  intensity: 3
});

const queue = new DebateFxQueue();
queue.push({ type: 'sod', strength: 'neutral', targetId: 'claim_no_action' });
assert.equal(queue.drain()[0].kind, 'airGlyphReveal');
assert.equal(queue.drain().length, 0);

console.log('B"H debate FX passed');
