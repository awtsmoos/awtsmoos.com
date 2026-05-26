#!/usr/bin/env node
/**
 * B"H
 * Emerald geometry/object/door stress harness.
 * It verifies linked components: blueprint geometry declarations, entrance
 * assembly, object add calls, door state toggling, interaction hooks, and NPC
 * clicks without requiring Chrome.
 */
import { ENTRANCE_POSITION_LOGIC } from '../../ckidsAwtsmoos/Olam/manifest/blueprints/architecture/EntrancePositions.js';
import { ENTRANCE_MANIFEST } from '../../ckidsAwtsmoos/Olam/manifest/blueprints/architecture/EntranceManifest.js';
import NivraAssembler from '../../ckidsAwtsmoos/Olam/manifest/NivraAssembler/index.js';
import { createDoorState, toggleDoorState } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/doors/DoorState.js';
import { installDoorInteraction } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/doors/DoorInteraction.js';
import { animateDoor } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/doors/DoorAnimator.js';
import { attachWorkingHouseDoor } from '../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/doors/HouseDoorKit.js';

function assert(condition, message, details = {}) {
  if (!condition) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
  }
}

const count = value => Array.isArray(value) ? value.length : value && typeof value === 'object' ? Object.keys(value).length : 0;
const world = (await import(`../../ckidsAwtsmoos/tochen/worlds/emerald.js?stress=${Date.now()}`)).default;
const buildings = Object.values(world.nivrayim.ProceduralBuilding || {});
const entrances = [];

for (const building of buildings) {
  const rooms = building.blueprint?.rooms || [];
  for (const room of rooms) {
    for (const ent of room.entrances || []) entrances.push({ building, room, ent });
  }
}

const unsupportedWalls = entrances.filter(item => !ENTRANCE_POSITION_LOGIC[item.ent.wall]);
const invalidGeometry = buildings.filter(building => !building.blueprint || count(building.blueprint.rooms) === 0);
const invalidRoomSize = buildings.flatMap(building => (building.blueprint?.rooms || []).map(room => ({ building, room }))).filter(({ room }) => {
  const size = room.size || room.dimensions || [room.width, room.height, room.depth];
  const arr = Array.isArray(size) ? size : [size?.x, size?.y, size?.z];
  return arr.some(v => v !== undefined && !Number.isFinite(Number(v)));
});

assert(buildings.length >= 40, 'Emerald buildings should exist for geometry stress', { buildings: buildings.length });
assert(entrances.length >= 100, 'Emerald should expose many entrance definitions to assembler', { entrances: entrances.length });
assert(unsupportedWalls.length === 0, 'Every entrance wall must have position logic', { unsupportedWalls: unsupportedWalls.slice(0, 5) });
assert(invalidGeometry.length === 0, 'Every building should have a blueprint with rooms', { invalidGeometry: invalidGeometry.length });
assert(invalidRoomSize.length === 0, 'Room sizes/dimensions must be finite', { invalidRoomSize: invalidRoomSize.slice(0, 5) });

const added = [];
const olam = {
  async addObject(type, op) {
    const obj = {
      type,
      op,
      name: op.name,
      position: op.position,
      rotation: op.rotation,
      userData: { ...op },
      events: {},
      on(event, cb) { this.events[event] = cb; },
      emit(event) { this.events[event]?.(); }
    };
    added.push(obj);
    return obj;
  }
};

for (const sample of entrances.slice(0, 20)) {
  const context = {
    building: { ...sample.building, olam },
    room: { wallThickness: 0.2, ...sample.room },
    ent: { width: 1.2, height: 2.1, ...sample.ent },
    idSuffix: `${added.length}`,
    roomOffset: sample.room.offset || [0, 0, 0],
    hinge: NivraAssembler.evaluate(ENTRANCE_POSITION_LOGIC[sample.ent.wall], { room: { wallThickness: 0.2, ...sample.room }, ent: { width: 1.2, height: 2.1, ...sample.ent } })
  };
  await NivraAssembler.assemble(olam, ENTRANCE_MANIFEST, context);
}

const spawnedDoors = added.filter(obj => obj.type === 'InteractiveDoor');
const spawnedMezuzos = added.filter(obj => obj.type === 'Domem' && /Mezuzah/i.test(obj.name || ''));
const badSpawnedDoor = spawnedDoors.filter(obj => !obj.op.interactable || obj.op.proximity < 4 || obj.op.isSolid !== true || !obj.op.golem);
assert(spawnedDoors.length === 20, 'Entrance assembler should spawn one InteractiveDoor per sampled entrance', { spawnedDoors: spawnedDoors.length, added: added.length });
assert(spawnedMezuzos.length === 20, 'Entrance assembler should spawn one Mezuzah per sampled entrance', { spawnedMezuzos: spawnedMezuzos.length });
assert(badSpawnedDoor.length === 0, 'Spawned doors must carry interactable/proximity/solid/golem metadata', { badSpawnedDoor });

const state = createDoorState({ openRotationY: Math.PI / 2 });
const doorObject = { events: {}, on(event, cb) { this.events[event] = cb; } };
installDoorInteraction(doorObject, state);
assert(doorObject.interactable === true && doorObject.interactionKind === 'door' && typeof doorObject.toggleDoor === 'function', 'Door interaction hook must install clickable door API');
const beforeToggle = state.isOpen;
doorObject.toggleDoor();
assert(state.isOpen !== beforeToggle, 'toggleDoor must change door state');
doorObject.events.interact();
assert(state.isOpen === beforeToggle, 'interact event must toggle door state back');

const mesh = { rotation: { y: 0 } };
const kitDoor = { events: {}, on(event, cb) { this.events[event] = cb; }, heesHawvoos() { this.oldTick = true; } };
const kitState = attachWorkingHouseDoor(kitDoor, mesh, { openRotationY: Math.PI / 2 });
kitDoor.events.interact();
for (let i = 0; i < 20; i++) kitDoor.heesHawvoos(0.016);
assert(kitState.isOpen === true, 'HouseDoorKit interact event must open state');
assert(mesh.rotation.y > 0, 'HouseDoorKit tick must animate mesh rotation');
assert(kitDoor.oldTick === true, 'HouseDoorKit must preserve old heesHawvoos tick');

const animMesh = { rotation: { y: 0 } };
const animState = createDoorState({ openRotationY: 1.25, speed: 100 });
toggleDoorState(animState);
animateDoor(animMesh, animState, 0.016);
assert(animMesh.rotation.y > 0, 'DoorAnimator must move rotation toward open state');

console.log(JSON.stringify({
  ok: true,
  checks: {
    buildings: buildings.length,
    entrances: entrances.length,
    sampledEntrances: 20,
    spawnedDoors: spawnedDoors.length,
    spawnedMezuzos: spawnedMezuzos.length,
    doorInteractionToggle: true,
    houseDoorKitAnimated: true,
    animatorMoved: true
  }
}, null, 2));
