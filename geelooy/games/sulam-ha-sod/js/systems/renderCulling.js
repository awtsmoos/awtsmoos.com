// B"H
/**
 * Allocation-light render culling.
 *
 * The Awtsmoos teaches the painter not to stare beyond the camera. These
 * helpers can either return a convenience array or fill a caller-owned list so
 * the renderer can keep painting without throwing little arrays into the abyss.
 */
export function visibleBodiesInto(bodies, cameraX, width = 960, out = [], pad = 140) {
  out.length = 0;
  const left = cameraX - pad;
  const right = cameraX + width + pad;
  for (const body of bodies) if (body.x + body.w >= left && body.x <= right) out.push(body);
  return out;
}

export function visiblePointsInto(things, cameraX, width = 960, out = [], pad = 120) {
  out.length = 0;
  const left = cameraX - pad;
  const right = cameraX + width + pad;
  for (const item of things) if (item.x >= left && item.x <= right) out.push(item);
  return out;
}

/** Legacy convenience helpers for tools/tests. */
export function visibleBodies(bodies, cameraX, width = 960, pad = 140) { return visibleBodiesInto(bodies, cameraX, width, [], pad); }
export function visiblePoints(things, cameraX, width = 960, pad = 120) { return visiblePointsInto(things, cameraX, width, [], pad); }
