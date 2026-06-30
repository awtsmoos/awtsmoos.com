// B"H
/**
 * A collider is a promise the world makes to the feet.
 * It may block, listen, open, or warn, but it must be measurable.
 */
const BLOCKING_KINDS = new Set(["solid", "house", "wall", "npc", "creature", "hazard"]);
const SOFT_KINDS = new Set(["trigger", "quest-zone", "cutscene-zone", "npc-zone", "combat-zone", "camera-zone"]);
const n = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;

export function makeBounds(input = {}) {
  if (input.bounds) return makeBounds(input.bounds);
  if (Number.isFinite(Number(input.minX))) {
    return {
      minX:n(input.minX), maxX:n(input.maxX),
      minZ:n(input.minZ), maxZ:n(input.maxZ)
    };
  }
  const x = n(input.x ?? input.cx ?? input.position?.x ?? input.position?.[0]);
  const z = n(input.z ?? input.cz ?? input.position?.z ?? input.position?.[2] ?? input.position?.[1]);
  const sx = Math.max(0.01, n(input.sx ?? input.width ?? input.w ?? input.size?.x ?? input.size?.[0], 1));
  const sz = Math.max(0.01, n(input.sz ?? input.depth ?? input.h ?? input.size?.z ?? input.size?.[1], 1));
  return { minX:x - sx / 2, maxX:x + sx / 2, minZ:z - sz / 2, maxZ:z + sz / 2 };
}

export function collisionBody(input = {}) {
  const kind = String(input.kind || input.type || "solid");
  const open = Boolean(input.open || input.isOpen);
  const trigger = Boolean(input.trigger) || SOFT_KINDS.has(kind) || /trigger|zone/.test(kind);
  const solid = input.solid !== undefined ? Boolean(input.solid) : BLOCKING_KINDS.has(kind) || kind === "door";
  return {
    id:String(input.id || `${kind}_${Math.random().toString(36).slice(2)}`),
    kind,
    bounds:makeBounds(input),
    solid,
    trigger,
    open,
    once:Boolean(input.once),
    data:input.data || input
  };
}

export function blocks(body) {
  if (!body || !body.solid) return false;
  return !(body.kind === "door" && body.open);
}

export function circleIntersectsBody(point, radius, body) {
  const b = body?.bounds;
  if (!b) return false;
  const x = Math.max(b.minX, Math.min(point.x, b.maxX));
  const z = Math.max(b.minZ, Math.min(point.z, b.maxZ));
  const dx = point.x - x, dz = point.z - z;
  return dx * dx + dz * dz <= radius * radius;
}

export function boundsIntersect(a, b) {
  return Boolean(a && b && a.minX <= b.maxX && a.maxX >= b.minX && a.minZ <= b.maxZ && a.maxZ >= b.minZ);
}

export function circleQueryBounds(point, radius) {
  return { minX:point.x - radius, maxX:point.x + radius, minZ:point.z - radius, maxZ:point.z + radius };
}
