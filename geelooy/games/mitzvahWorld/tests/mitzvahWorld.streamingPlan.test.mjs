import assert from 'node:assert/strict';
import { planStreaming } from '../ckidsAwtsmoos/Olam/runtime/streaming/StreamingPlanRuntime.js';

const plan = planStreaming({
  currentMapId: 'emerald_void_street',
  loaded: ['old_road', 'emerald_void_street'],
  graph: { emerald_void_street: ['holy_quarter', 'residential_district'] }
});

assert.deepEqual(plan.keep, ['emerald_void_street', 'holy_quarter', 'residential_district']);
assert.deepEqual(plan.load, ['holy_quarter', 'residential_district']);
assert.deepEqual(plan.unload, ['old_road']);

console.log('B"H streaming plan passed');
