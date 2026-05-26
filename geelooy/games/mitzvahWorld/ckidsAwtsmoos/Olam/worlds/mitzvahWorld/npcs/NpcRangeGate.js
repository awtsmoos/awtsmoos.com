/**
 * B"H
 * @file NpcRangeGate.js
 * @description
 * Chapter 56: The Circle Around The Speaking Soul.
 * The Awtsmoos lets dialogue be close, not vague: a click becomes accepted
 * only when player and NPC stand within a measured, mobile-friendly radius.
 */

function xyz(source = {}) {
  const p = source.position || source.userData?.position || source;
  return {
    x: Number(p.x ?? p[0] ?? 0),
    y: Number(p.y ?? p[1] ?? 0),
    z: Number(p.z ?? p[2] ?? 0)
  };
}

export function npcDistance(a, b) {
  const pa = xyz(a);
  const pb = xyz(b);
  const dx = pa.x - pb.x;
  const dy = pa.y - pb.y;
  const dz = pa.z - pb.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function isNpcInRange(npc, player, range = 4.5) {
  return npcDistance(npc, player) <= range;
}

export function describeNpcRange(npc, player, range = 4.5) {
  const distance = npcDistance(npc, player);
  return { ok: distance <= range, distance, range };
}
