// B"H
/**
 * @file EntityRecordCodec.js
 * @description Chapter 465: full beings compress into records and return
 * without losing identity, sector, or the time they last breathed.
 */
export function encodeEntityRecord(entity = {}, now = Date.now()) {
  const pos = entity.mesh?.position || entity.position || entity.lastKnownTransform || {};
  return {
    id: entity.id || entity.name,
    sectorId: entity.sectorId || null,
    archetype: entity.type || entity.archetype || "entity",
    seed: entity.seed || 0,
    lastSimTime: entity.lastSimTime || now,
    transform: { x: pos.x || 0, y: pos.y || 0, z: pos.z || 0 },
    state: entity.compressedState || entity.state || null,
    dirtyVersion: (entity.dirtyVersion || 0) + 1
  };
}
export function decodeEntityRecord(record = {}) {
  return {
    id: record.id,
    sectorId: record.sectorId,
    archetype: record.archetype,
    seed: record.seed || 0,
    lastSimTime: record.lastSimTime || 0,
    position: { ...(record.transform || {}) },
    compressedState: record.state || null,
    dirtyVersion: record.dirtyVersion || 0
  };
}
export function catchUpRecord(record, now = Date.now()) {
  const elapsedMs = Math.max(0, now - (record.lastSimTime || now));
  return { ...record, catchUpElapsedMs: elapsedMs, lastSimTime: now };
}
