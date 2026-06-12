import { outward } from '../kill/launchDirection.js';

/**
 * B"H
 * Edge carry plan.
 *
 * Chapter 226: pushing off cliffs becomes deliberate. The bot stands deeper on
 * the inside shoulder of the target, presses toward the nearest blast wall, and
 * keeps carry active earlier so damage turns into exile instead of wandering.
 */
export function edgeCarryPlan(bot, world) {
  const dir = outward(bot, world);
  const standX = world.target.x - dir * 112;
  const distance = Math.abs(bot.x - standX);
  const pressure = world.koPressure || {};
  const active = !!pressure.window?.carryNeeded || pressure.side > 28 || pressure.carry > 34;
  const score = Math.max(0, 105 - distance * 0.06 + (pressure.carry || 0) * 0.8 + (pressure.side || 0) * 0.25);
  return { active, dir, standX, distance, score };
}
