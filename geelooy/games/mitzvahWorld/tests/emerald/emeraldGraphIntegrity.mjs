#!/usr/bin/env node
/**
 * B"H
 * Emerald room graph + mission linkage integrity.
 */
import emerald from '../../ckidsAwtsmoos/tochen/worlds/emerald.js';
import { SHLICHUS_MANIFEST } from '../../ckidsAwtsmoos/tochen/shlichus/shlichusManifest.js';

function assert(condition, message, details = {}) {
  if (!condition) {
    console.error(JSON.stringify({ ok: false, message, details }, null, 2));
    process.exit(1);
  }
}

const buildings = Object.values(emerald.nivrayim.ProceduralBuilding || {});
const npc = Object.values(emerald.nivrayim.InteractiveNpc || {});
const missionIds = new Set(Object.keys(SHLICHUS_MANIFEST));
const roomNames = new Set();
const duplicateRooms = [];
const brokenEntrances = [];

for (const building of buildings) {
  for (const [roomIndex, room] of (building.blueprint?.rooms || []).entries()) {
    const roomName = room.name || `${building.name}-room-${roomIndex}`;
    room.generatedRoomId = room.generatedRoomId || roomName;
    const key = `${building.name}:${room.generatedRoomId}`;
    if (roomNames.has(key)) duplicateRooms.push(key);
    roomNames.add(key);

    for (const ent of room.entrances || []) {
      if (!ent.wall || !Number.isFinite(ent.offset ?? 0)) {
        brokenEntrances.push({ room: room.name, ent });
      }
    }
  }
}

const missionNpc = npc.filter(x => x.missionId);
const missingMissions = missionNpc.filter(x => !missionIds.has(x.missionId));
const debateNpc = npc.filter(x => x.debateDeckId);
const emptyDebates = debateNpc.filter(x => !x.debateDeckId || typeof x.debateDeckId !== 'string');

assert(duplicateRooms.length === 0, 'Duplicate room names detected', { duplicateRooms });
assert(brokenEntrances.length === 0, 'Broken entrance metadata detected', { brokenEntrances: brokenEntrances.slice(0, 5) });
assert(missingMissions.length === 0, 'NPC mission IDs missing from shlichus manifest', { missingMissions });
assert(emptyDebates.length === 0, 'Debate NPCs missing debate deck IDs', { emptyDebates });

console.log(JSON.stringify({
  ok: true,
  checks: {
    buildings: buildings.length,
    rooms: roomNames.size,
    missionNpc: missionNpc.length,
    debateNpc: debateNpc.length
  }
}, null, 2));
