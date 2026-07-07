// B\"H
/** Farther coils carry higher risk and reward, without punishing the first breath. */
export function snakePathDangerForSegment(segment, { base = 1, step = 0.22 } = {}) {
  const level = Math.max(1, Math.round(base + segment.index * step));
  return { level, rewardMultiplier: Number((1 + segment.index * 0.08).toFixed(2)) };
}
