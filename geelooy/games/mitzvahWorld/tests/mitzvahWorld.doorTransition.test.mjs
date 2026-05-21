import assert from 'node:assert/strict';
import { DoorTransitionRuntime } from '../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/doors/DoorTransitionRuntime.js';

const runtime = new DoorTransitionRuntime();
const door = {
  name: 'house_door_1',
  userData: {
    locked: false,
    destination: 'houseInterior'
  }
};

assert.equal(runtime.openDoor(door, { id: 'player_1' }).ok, true);
assert.equal(door.userData.isOpen, true);
assert.equal(runtime.closeDoor(door).ok, true);
assert.equal(door.userData.isOpen, false);
console.log('B"H door transition passed');
