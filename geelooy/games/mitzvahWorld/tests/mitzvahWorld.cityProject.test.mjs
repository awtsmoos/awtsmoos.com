import assert from 'node:assert/strict';
import { CityProjectRuntime } from '../ckidsAwtsmoos/Olam/runtime/city/CityProjectRuntime.js';

const bridge = new CityProjectRuntime({
  id: 'repair_emerald_bridge',
  requires: { wood: 6, stone: 2 },
  effects: { openRoad: 'holy_quarter', morale: 2, dangerDelta: -1 }
});

assert.equal(bridge.deliver('wood', 6).completed, false);
const done = bridge.deliver('stone', 2);
assert.equal(done.completed, true);
assert.deepEqual(done.effects, { openRoad: 'holy_quarter', morale: 2, dangerDelta: -1 });
assert.deepEqual(bridge.deliver('wood', 99), done);
assert.throws(() => new CityProjectRuntime({}), /project id is required/);

console.log('B"H city project passed');
