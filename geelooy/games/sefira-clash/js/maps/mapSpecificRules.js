/**
 * B"H
 * Map-specific rule modifiers.
 *
 * Chapter 71: not every arena asks the same question. Pinball demands inward
 * collisions, Vast demands center gatherings, Bouncer demands vertical pursuit.
 */
export function mapRuleModifiers(map) {
  const id = map.id || '';
  if (id.includes('pinball')) return { inwardPull: 1.55, objectiveCooldownScale: 0.62, itemCenterBias: 1.3, edgeCarryScale: 0.72, storyTempo: 1.35 };
  if (id.includes('vast')) return { inwardPull: 1.25, objectiveCooldownScale: 0.55, itemCenterBias: 1.45, edgeCarryScale: 0.65, storyTempo: 1.1 };
  if (id.includes('bouncer')) return { inwardPull: 1.05, objectiveCooldownScale: 0.85, itemCenterBias: 1.0, edgeCarryScale: 0.9, storyTempo: 1.25 };
  return { inwardPull: 1, objectiveCooldownScale: 1, itemCenterBias: 1, edgeCarryScale: 1, storyTempo: 1 };
}

export function mapRallyPoint(map) {
  const zone = map.zones?.centerControl?.[0] || map.zones?.landingTrap?.[0];
  if (zone) return { x: zone.x, y: zone.y };
  return { x: (map.bounds.left + map.bounds.right) / 2, y: 300 };
}
