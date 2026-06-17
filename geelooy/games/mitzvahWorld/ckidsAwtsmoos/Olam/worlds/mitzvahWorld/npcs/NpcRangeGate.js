// B"H
/**
 * @file NpcRangeGate.js
 * @description NPC distance gates with explicit coordinate coercion and stable diagnostics.
 *
 * In the little village of code, the player approaches an NPC, and the world
 * must answer with certainty: near, far, distance, range, reason. This module
 * is the gatekeeper, exporting every name that OlamVessel expects so the vessel
 * may open without throwing the traveler back into red console exile.
 */

function dataOf(source) {
  return source && source.userData ? source.userData : {};
}

function rawPosition(source) {
  const data = dataOf(source);
  if (source && source.position) return source.position;
  if (data.position) return data.position;
  if (Array.isArray(source)) return source;
  return source || {};
}

function coord(point, key, index) {
  if (point && point[key] !== undefined) return Number(point[key]) || 0;
  if (point && point[index] !== undefined) return Number(point[index]) || 0;
  return 0;
}

export function pointFrom(source) {
  const point = rawPosition(source);
  return { x:coord(point, "x", 0), y:coord(point, "y", 1), z:coord(point, "z", 2) };
}

export function distanceBetween(a, b) {
  const pa = pointFrom(a), pb = pointFrom(b);
  return Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z);
}

export function isNpcInRange(npc, actor, range = 8) {
  return distanceBetween(npc, actor) <= Number(range || 0);
}

export function describeNpcRange(npc, actor, range = 8) {
  const distance = distanceBetween(npc, actor);
  const allowedRange = Number(range || 0);
  const inRange = distance <= allowedRange;
  return {
    npc,
    actor,
    npcPoint:pointFrom(npc),
    actorPoint:pointFrom(actor),
    distance,
    range:allowedRange,
    inRange,
    state:inRange ? "near" : "far"
  };
}

export default isNpcInRange;
