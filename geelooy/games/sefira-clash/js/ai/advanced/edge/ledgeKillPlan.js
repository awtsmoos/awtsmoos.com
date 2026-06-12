import { offstageRead } from './offstageRead.js';

/**
 * B"H
 * Ledge kill plan.
 *
 * Chapter 225: ledgeguarding waits for true exile. Near the lip, the correct
 * violence is carry and horizontal kill; offstage, the bot covers high, low,
 * inward, and falling recoveries with brutal specificity.
 */
export function ledgeKillPlan(bot, world) {
  const read = offstageRead(world.target, world);
  if (!read.offstage) return { active: false, read, family: 'none', standX: bot.x, score: 0 };
  if (read.low) return plan(read, 'meteor', world.target.x - read.side * 75, 95);
  if (read.high) return plan(read, 'antiAir', world.target.x - read.side * 65, 80);
  if (read.inward) return plan(read, 'kick', world.target.x - read.side * 95, 82);
  return plan(read, 'chargeKick', world.target.x - read.side * 90, 88);
}

function plan(read, family, standX, score) {
  return { active: true, read, family, standX, score, dir: read.side };
}
