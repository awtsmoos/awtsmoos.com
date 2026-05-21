import assert from 'node:assert/strict';
import { InteriorPortalRuntime } from '../ckidsAwtsmoos/Olam/runtime/interiors/InteriorPortalRuntime.js';

const portals = new InteriorPortalRuntime();
portals.registerRoom({ id: 'house_yosei_main', houseId: 'house_yosei', exits: ['emerald_street'] });

const entered = portals.enterInterior({
  roomId: 'house_yosei_main',
  fromMapId: 'emerald_void_street',
  playerPosition: { x: 4, y: 0, z: 9 }
});

assert.equal(entered.room.state.visited, true);
assert.equal(portals.snapshot().active.roomId, 'house_yosei_main');
assert.equal(portals.exitInterior().fromMapId, 'emerald_void_street');
assert.equal(portals.snapshot().active, null);
assert.throws(() => portals.enterInterior({ roomId: 'missing' }), /Unknown interior room/);

console.log('B"H interior portal passed');
