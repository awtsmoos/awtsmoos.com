// B\"H
/**
 * The snake path bends ahead of the player: curved road-segments become
 * streaming promises, not one giant first-load burden.
 */
export function createSnakePathSegments({ length = 360, segmentLength = 36, amplitude = 18 } = {}) {
  const count = Math.max(1, Math.ceil(length / segmentLength));
  return Array.from({ length: count }, (_, index) => {
    const z0 = index * segmentLength;
    const z1 = z0 + segmentLength;
    const cx = Math.sin(index * 0.72) * amplitude;
    return { id: `snake-${index}`, index, z0, z1, center: { x: cx, y: 0, z: (z0 + z1) / 2 } };
  });
}
