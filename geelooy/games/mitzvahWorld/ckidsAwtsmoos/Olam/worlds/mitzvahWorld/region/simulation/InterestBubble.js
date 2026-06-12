// B"H
/**
 * @file InterestBubble.js
 * @description The player receives the near world in detail; the far world rests in mercy.
 */
export function createInterestBubble(center = { x: 0, z: 0 }, radii = {}) {
  return { version: "interest-bubble-v1", center, radii: { immediate: 90, nearby: 180, visible: 360, ...radii } };
}

export function distanceToBubble(bubble, x = 0, z = 0) {
  const c = bubble.center || { x: 0, z: 0 };
  return Math.hypot((x || 0) - (c.x || 0), (z || 0) - (c.z || 0));
}

export function tierForDistance(bubble, distance) {
  const r = bubble.radii || {};
  if (distance <= r.immediate) return 0;
  if (distance <= r.nearby) return 1;
  if (distance <= r.visible) return 2;
  return 3;
}
