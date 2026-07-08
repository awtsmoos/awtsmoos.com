// B"H
import { collisionBody, circleIntersectsBody } from "../collision/CollisionBody2D.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

export function validateVillageDensity(input = {}) {
  const bounds = input.bounds || { minX:0, maxX:60, minZ:0, maxZ:60 };
  const blockers = (input.houses || []).map(h => collisionBody({ ...h, kind:"house", solid:true }));
  const issues = [];
  for (let i = 0; i < blockers.length; i++) for (let j = i + 1; j < blockers.length; j++) {
    if (overlap(blockers[i].bounds, blockers[j].bounds, n(input.minSpacing, 0.15))) issues.push(`house-overlap:${blockers[i].id}:${blockers[j].id}`);
  }
  for (const spawn of input.spawns || []) {
    if (blockers.some(body => circleIntersectsBody(spawn, n(spawn.radius, 0.55), body))) issues.push(`spawn-blocked:${spawn.id || "spawn"}`);
  }
  const grid = scanGrid(bounds, input.cellSize || 4, [...blockers, ...(input.roads || []), ...(input.points || [])]);
  if (grid.emptyRatio > n(input.maxEmptyRatio, 0.42)) issues.push(`empty-ratio:${grid.emptyRatio.toFixed(3)}`);
  for (const door of input.doors || []) {
    if (!nearAny(door, input.roads || [], n(input.maxDoorRoadDistance, 7))) issues.push(`door-unreachable:${door.id || "door"}`);
  }
  return { ok:issues.length === 0, issues, houses:blockers.length, emptyRatio:grid.emptyRatio, scannedCells:grid.cells };
}

function overlap(a, b, pad = 0) {
  return a.minX - pad <= b.maxX && a.maxX + pad >= b.minX && a.minZ - pad <= b.maxZ && a.maxZ + pad >= b.minZ;
}

function scanGrid(bounds, cellSize, features) {
  let empty = 0, cells = 0;
  for (let x = bounds.minX; x <= bounds.maxX; x += cellSize) {
    for (let z = bounds.minZ; z <= bounds.maxZ; z += cellSize) {
      cells++;
      if (!features.some(f => covers(f, { x, z }, cellSize * 1.25))) empty++;
    }
  }
  return { cells, empty, emptyRatio:cells ? empty / cells : 1 };
}

function covers(feature, point, radius) {
  const body = feature.bounds || feature.width || feature.depth || feature.size
    ? collisionBody({ ...feature, kind:"soft" })
    : null;
  if (body) return circleIntersectsBody(point, radius, body);
  const p = feature.position || feature;
  return Math.hypot(n(p.x) - point.x, n(p.z ?? p.y) - point.z) <= radius;
}

function nearAny(point, items, maxDistance) {
  return items.some(item => {
    if (item.bounds || item.width || item.depth || item.size) return circleIntersectsBody(point, maxDistance, collisionBody({ ...item, kind:"road", solid:false }));
    const p = item.position || item;
    return Math.hypot(n(p.x) - n(point.x), n(p.z ?? p.y) - n(point.z ?? point.y)) <= maxDistance;
  });
}
