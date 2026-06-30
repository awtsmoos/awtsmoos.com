// B"H
const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const occupancyRadius = radius => Math.max(0.01, radius * 0.96);

export function entityPoint(entity = {}) {
  const pos = entity.mesh?.position || entity.position || entity;
  return {
    x:num(pos.x),
    y:num(pos.y, 0),
    z:num(pos.z ?? pos.y ?? entity.z ?? entity.y)
  };
}

export function insideBounds(point, bounds = {}) {
  const minX = num(bounds.minX, -Infinity), maxX = num(bounds.maxX, Infinity);
  const minZ = num(bounds.minZ, -Infinity), maxZ = num(bounds.maxZ, Infinity);
  return point.x >= minX && point.x <= maxX && point.z >= minZ && point.z <= maxZ;
}

export function groundStatus(entity = {}, context = {}) {
  const point = entityPoint(entity);
  const radius = num(entity.radius ?? context.radius, 0.55);
  const minY = num(context.minY, 0);
  const blockers = context.world?.blockingAt?.({ x:point.x, z:point.z }, occupancyRadius(radius)) || [];
  const bounds = context.bounds || context.data?.bounds || {};
  const belowGround = Number.isFinite(point.y) && point.y < minY;
  const inBounds = insideBounds(point, bounds);
  return {
    id:String(entity.id || entity.name || "entity"),
    point,
    radius,
    aboveGround:!belowGround && inBounds && blockers.length === 0,
    belowGround,
    inBounds,
    insideSolid:blockers.length > 0,
    blockers:blockers.map(body => body.id)
  };
}

export default { entityPoint, insideBounds, groundStatus };
