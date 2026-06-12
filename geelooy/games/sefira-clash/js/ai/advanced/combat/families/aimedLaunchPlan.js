/**
 * B"H
 * Aimed launch plan.
 *
 * Chapter 205: the chosen attack family receives the launch vector from the KO
 * intent. The button presses, but the aim tells the story.
 */
export function aimForFamily(world, familyName) {
  const launch = world.launchPlan || { aimX: Math.sign(world.target.x - world.botX || 1), aimY: 0 };
  if (familyName === 'antiAir') return { aimX: launch.aimX || 0.15, aimY: -1 };
  if (familyName === 'meteor') return { aimX: launch.aimX || 0.2, aimY: 1 };
  if (familyName === 'rapid') return { aimX: Math.sign(world.target.x - world.botX || launch.aimX || 1), aimY: 0 };
  return { aimX: launch.aimX || 1, aimY: launch.aimY || 0 };
}
