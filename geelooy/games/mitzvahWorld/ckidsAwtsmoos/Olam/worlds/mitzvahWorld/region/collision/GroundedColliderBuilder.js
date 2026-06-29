// B"H
/**
 * @file GroundedColliderBuilder.js
 * @description
 * Turns visible world records into center-based collider specs. Three.js boxes
 * and cylinders live around their center, so the y coordinate must be
 * `ground + height / 2`, never just the terrain height.
 */

const DEFAULT_SIZE = Object.freeze([1, 1, 1]);

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function sizeOf(record = {}) {
  const raw = Array.isArray(record.size)
    ? record.size
    : [record.sx, record.sy || record.height, record.sz || record.depth];
  return [
    Math.max(0.05, num(raw[0], DEFAULT_SIZE[0])),
    Math.max(0.05, num(raw[1], DEFAULT_SIZE[1])),
    Math.max(0.05, num(raw[2], DEFAULT_SIZE[2]))
  ];
}

function xzOf(record = {}) {
  const position = Array.isArray(record.position) ? record.position : null;
  return {
    x: num(record.x, num(position?.[0], 0)),
    z: num(record.z, num(position?.[2], 0))
  };
}

function normalizedCollider(record = {}, groundAt = () => 0, category = record.category || record.type || "solid") {
  const size = sizeOf(record);
  const { x, z } = xzOf(record);
  const baseY = num(record.baseY, groundAt(x, z));
  const liftY = num(record.liftY, num(record.yOffset, 0));
  const centerY = baseY + liftY + size[1] / 2;
  return {
    ...record,
    category,
    size,
    x,
    z,
    y: centerY,
    position: [x, centerY, z],
    baseY,
    grounded: true,
    centerBased: true,
    merged: true,
    yaw: num(record.yaw, 0),
    visibleTwin: record.visibleTwin !== false
  };
}

function closedDoorRecords(classification = {}) {
  return [...(classification.doors || []), ...(classification.door || [])]
    .filter(record => record && record.open !== true && record.isOpen !== true);
}

export function buildGroundedColliderSpecs(classification = {}, groundAt = () => 0) {
  const hard = (classification.hard || []).map(record => normalizedCollider(record, groundAt));
  const doors = closedDoorRecords(classification).map(record => {
    return normalizedCollider(record, groundAt, record.category || "closed-door");
  });
  return [...hard, ...doors];
}

export function colliderBudgetSummary(colliders = []) {
  const doors = colliders.filter(c => c.category === "closed-door");
  const hard = colliders.filter(c => c.category !== "closed-door");
  return {
    colliders: colliders.length,
    hard: hard.length,
    doors: doors.length,
    centerBased: colliders.every(c => c.centerBased === true),
    grounded: colliders.every(c => c.grounded === true),
    budgetOk: colliders.length <= 140
  };
}

export function auditGroundedColliderSpecs(colliders = []) {
  const bad = colliders.filter(c => {
    const size = c.size || [];
    const pos = c.position || [];
    return !c.centerBased || !Number.isFinite(pos[1]) || pos[1] < c.baseY || size.some(v => !Number.isFinite(v) || v <= 0);
  });
  return {
    ok: bad.length === 0,
    bad: bad.map(c => c.id || c.name || c.category || "collider"),
    ...colliderBudgetSummary(colliders)
  };
}

export default {
  buildGroundedColliderSpecs,
  colliderBudgetSummary,
  auditGroundedColliderSpecs
};
