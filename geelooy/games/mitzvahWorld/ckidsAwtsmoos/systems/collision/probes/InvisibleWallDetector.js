// B"H
import { hasCanonicalOwner, ownerMetadata } from "./CollisionOwnerMetadata.js";

export function unownedBlockers(world, hitIds = []) {
  const violations = [];
  for (const id of hitIds) {
    const body = world?.bodies?.get?.(id);
    if (!body || hasCanonicalOwner(body)) continue;
    violations.push({ type:"invisible-wall", blocker:ownerMetadata(body) });
  }
  return violations;
}

export function probeOpenPath(world, path = [], radius = 0.55) {
  const violations = [];
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1], to = path[i];
    const moved = world.moveCircle(from, { x:to.x - from.x, z:to.z - from.z }, radius);
    violations.push(...unownedBlockers(world, moved.hits));
  }
  return violations;
}

export default { unownedBlockers, probeOpenPath };
