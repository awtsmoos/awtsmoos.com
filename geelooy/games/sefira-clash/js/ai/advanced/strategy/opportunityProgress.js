/**
 * B"H
 * Opportunity progress scorer.
 *
 * Chapter 65: a strategy must earn its oxygen. Edge pressure must move the foe
 * toward danger or toward attack range; landing intercept must draw the bot to
 * the landing shadow. Empty strategy loses rank to honest chase.
 */
export function scoreOpportunityProgress(bot, world) {
  const edge = edgeProgress(bot, world);
  const landing = landingProgress(bot, world);
  const chase = chaseUrgency(bot, world);
  return { edge, landing, chase };
}

function edgeProgress(bot, world) {
  const edge = world.edgePressure;
  if (!edge?.active) return 0;
  const targetToLedge = Math.abs(world.target.x - edge.ledgeX);
  const botCanReach = Math.max(0, 140 - Math.abs(world.target.x - bot.x));
  const towardLedge = Math.sign(world.target.vx || 0) === edge.side ? 26 : -10;
  return clamp(54 - targetToLedge * 0.13 + botCanReach * 0.14 + towardLedge, -40, 70);
}

function landingProgress(bot, world) {
  if (!world.landing?.active) return 0;
  const d = Math.hypot(world.landing.x - bot.x, (world.landing.y - bot.y) * 0.35);
  return clamp(64 - d * 0.055, -35, 70);
}

function chaseUrgency(bot, world) {
  const d = Math.hypot(world.target.x - bot.x, (world.target.y - bot.y) * 0.45);
  const longNoHit = (bot.aiMind?.noHitFrames || 0) > 240 ? 28 : 0;
  return clamp(18 + d * 0.018 + longNoHit, 18, 85);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
