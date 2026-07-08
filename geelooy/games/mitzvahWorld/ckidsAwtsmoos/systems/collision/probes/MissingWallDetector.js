// B"H
import { blocks } from "../CollisionBody2D.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function center(bounds) {
  return { x:(bounds.minX + bounds.maxX) / 2, z:(bounds.minZ + bounds.maxZ) / 2 };
}

export function probeSolidBody(world, body, radius = 0.55) {
  const c = center(body.bounds);
  const start = { x:body.bounds.minX - radius - 0.2, z:c.z };
  const delta = { x:body.bounds.maxX - body.bounds.minX + radius + 0.4, z:0 };
  const moved = world.moveCircle(start, delta, radius);
  return {
    bodyId:body.id,
    blocked:moved.blocked,
    hit:moved.hits.includes(body.id),
    hits:moved.hits
  };
}

export function findMissingWalls(world, radius = 0.55) {
  const violations = [];
  for (const body of world?.bodies?.values?.() || []) {
    if (!blocks(body)) continue;
    const probe = probeSolidBody(world, body, radius);
    if (!probe.blocked || !probe.hit) violations.push({ type:"missing-wall", ...probe });
  }
  return violations;
}

export default { probeSolidBody, findMissingWalls };
