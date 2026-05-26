/**
 * B"H
 * @file EmeraldVoidFeaturePostBuild.js
 * @description
 * Chapter 4: The Invisible Contract Became Touch.
 * Entrances, room doorways, mezuzos, NPC spawn points, borrowing desks,
 * tower motor rooms, and feature counts are pulled from compact data and
 * marked in the scene. The Awtsmoos turns forgotten props into inspectable
 * vessels without heavy geometry or mobile pain.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { EMERALD_HOUSE_LOTS } from '../data/nefashos/EmeraldVoidStreet.js';
import { EMERALD_VOID_GENERATED_DISTRICT } from '../data/nefashos/EmeraldVoidGeneratedDistrict.js';
import { createDoorMesh } from '../doors/DoorMeshFactory.js';
import { createDoorState, toggleDoorState } from '../doors/DoorState.js';

const FEATURES = [...EMERALD_HOUSE_LOTS, ...EMERALD_VOID_GENERATED_DISTRICT];
const GOLD = () => new THREE.MeshLambertMaterial({ color: 0xd8b547 });
const MARK = () => new THREE.MeshBasicMaterial({ color: 0x40ffbc, transparent: true, opacity: 0.35 });

function makeDoor(def, house, index, kind) {
  const door = createDoorMesh({ name: `${house.id}_${def.id || kind}_${index}` });
  const [hx, hy, hz] = house.position || [0, 0, 0];
  door.position.set(hx + (index % 3) * 1.6 - 1.6, hy + 1.05, hz - 4.25 - index * 0.08);
  door.userData.emeraldFeature = kind;
  door.userData.houseId = house.id;
  door.userData.room = def.room || null;
  door.userData.hasMezuzah = Boolean(def.hasMezuzah);
  door.userData.clickToToggle = true;

  const state = createDoorState({ openRotationY: Math.PI * 0.55 });
  door.userData.doorState = state;
  door.toggleDoor = () => toggleDoorState(state);
  door.userData.onInteract = () => door.toggleDoor();
  return door;
}

function makeMezuzah(door) {
  const mezuzah = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.04), GOLD());
  mezuzah.name = `${door.name}_mezuzah`;
  mezuzah.position.copy(door.position).add(new THREE.Vector3(0.72, 0.28, -0.09));
  mezuzah.userData.emeraldFeature = 'mezuzah';
  mezuzah.userData.houseId = door.userData.houseId;
  return mezuzah;
}

function makeNpcMarker(house, spawn, index) {
  const [hx, hy, hz] = house.position || [0, 0, 0];
  const [sx, sy, sz] = spawn.position || [0, 0, 0];
  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), MARK());
  marker.name = `${house.id}_${spawn.id || 'npc'}_spawn`;
  marker.position.set(hx + sx, hy + sy + 0.35, hz + sz);
  marker.userData.emeraldFeature = 'npcSpawnPoint';
  marker.userData.houseId = house.id;
  marker.userData.room = spawn.room || null;
  marker.userData.index = index;
  return marker;
}

function makeDeskMarker(house) {
  const [x, y, z] = house.position || [0, 0, 0];
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.7), GOLD());
  desk.name = `${house.id}_borrowing_desk`;
  desk.position.set(x, y + 0.4, z - 1.2);
  desk.userData.emeraldFeature = 'borrowingSystem';
  desk.userData.houseId = house.id;
  desk.userData.items = house.props?.borrowingSystem?.items || [];
  return desk;
}

function houseDoors(house) {
  const props = house.props || {};
  return [
    ...(props.entrances || []).map((door, index) => [door, index, 'frontDoor']),
    ...(props.interiorDoorways || []).map((door, index) => [door, index + 10, 'roomDoor']),
    ...(props.stairs?.hasDoor ? [[{ id: 'stairs_door', hasMezuzah: true }, 20, 'stairDoor']] : []),
    ...(props.motorRoom?.hasDoor ? [[{ id: 'motor_room', hasMezuzah: props.motorRoom.hasMezuzah }, 30, 'motorRoomDoor']] : [])
  ];
}

export async function ensureEmeraldVoidFeatures(context = {}) {
  const scene = context.scene || context.olam?.scene;
  if (!scene) throw new Error('Cannot ensure Emerald Void features without scene');
  if (scene.userData.emeraldVoidFeaturesReady) return [];

  const made = [];
  const counts = { houses: 0, skyscrapers: 0, doors: 0, mezuzos: 0, npcSpawns: 0, borrowingSystems: 0 };

  for (const house of FEATURES) {
    if (house.type === 'skyscraper') counts.skyscrapers++;
    if (String(house.type).includes('House')) counts.houses++;

    for (const [doorDef, index, kind] of houseDoors(house)) {
      const door = makeDoor(doorDef, house, index, kind);
      scene.add(door); made.push(door); counts.doors++;
      if (doorDef.hasMezuzah) { const mezuzah = makeMezuzah(door); scene.add(mezuzah); made.push(mezuzah); counts.mezuzos++; }
    }

    for (const [index, spawn] of (house.props?.npcSpawnPoints || []).entries()) {
      const marker = makeNpcMarker(house, spawn, index);
      scene.add(marker); made.push(marker); counts.npcSpawns++;
    }

    if (house.props?.borrowingSystem?.enabled) {
      const desk = makeDeskMarker(house);
      scene.add(desk); made.push(desk); counts.borrowingSystems++;
    }
  }

  scene.userData.emeraldVoidFeaturesReady = true;
  scene.userData.emeraldVoidFeatureCounts = counts;
  return made;
}
