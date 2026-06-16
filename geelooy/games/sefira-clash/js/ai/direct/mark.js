/** B"H — simulator-visible thought stamps, refined so commanded pressure is not mislabeled as idle. */
export function mark(bot, out, state, opportunity, tactic) {
  bot.aiMind ||= {};
  const attacking = !!(out.punch || out.kick || out.grab || out.rapidPunch || out.chargePunch || out.chargeKick);
  const moving = Math.abs(out.x || 0) > 0.1 || !!(out.jump || out.special);
  bot.aiMind.state = state;
  bot.aiMind.mode = state;
  bot.aiMind.opportunity = { name: opportunity, intent: opportunity };
  bot.aiMind.commitment = { name: state, ttl: 12, age: 0 };
  bot.aiMind.attackCheck = { valid: !!(out.punch || out.kick || out.grab || out.rapidPunch), reason: tactic };
  bot.aiMind.tactic = tactic;
  bot.aiMind.jumpReason = out.jump ? (state === 'Recover' ? 'RecoveryJump' : 'PressureJump') : 'none';
  bot.aiMind.lastOutputX = out.x || 0;
  if ((attacking || moving) && bot.aiMind.positionLoop) {
    bot.aiMind.positionLoop.idleNearEnemyFrames = 0;
  }
  return out;
}
