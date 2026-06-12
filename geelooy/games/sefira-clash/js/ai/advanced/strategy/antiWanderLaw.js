/**
 * B"H
 * Anti-wander law.
 *
 * Chapter 83: no bot may drift forever in a quiet kingdom. If combat vanishes,
 * the nearest hot cluster, resource ping, or rally point becomes command.
 */
export function antiWanderLaw(bot, world) {
  const quiet = world.combatHeat?.noDamageFrames || 0;
  const vast = world.map?.id?.includes('vast');
  const far = world.fightCluster?.nearest?.distance > (vast ? 820 : 680);
  const active = quiet > (vast ? 150 : 230) || far || world.resourcePing?.active;
  if (!active) return { active: false, reason: 'clear' };
  const point = choosePoint(world);
  return { active: true, x: point.x, y: point.y, reason: point.reason, sprint: true };
}

function choosePoint(world) {
  if (world.resourcePing?.active && world.resourcePing.value > 40) return { x: world.resourcePing.x, y: world.resourcePing.y, reason: 'resourcePing' };
  if (world.fightCluster?.hottest) return { x: world.fightCluster.hottest.x, y: world.fightCluster.hottest.y, reason: 'hotCluster' };
  const rally = world.map?.zones?.centerControl?.[0];
  if (rally) return { x: rally.x, y: rally.y, reason: 'centerRally' };
  return { x: (world.map.bounds.left + world.map.bounds.right) / 2, y: 240, reason: 'mapCenter' };
}
