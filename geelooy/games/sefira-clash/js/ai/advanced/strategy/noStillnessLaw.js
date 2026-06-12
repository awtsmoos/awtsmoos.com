/**
 * B"H
 * No-stillness law.
 *
 * Chapter 93: an awake fighter must move, decide, or strike. Stillness has a
 * place in meditation, not beside a dangerous opponent. This law produces a
 * small lawful nudge: cross up, leave poisoned ledge, or advance toward battle.
 */
export function updateNoStillnessLaw(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.noStillness ||= freshLaw();
  const law = bot.aiMind.noStillness;
  const idle = idleNow(bot);
  law.idleFrames = idle ? law.idleFrames + 1 : 0;
  const near = Math.abs(world.target.x - bot.x) < 210 && Math.abs(world.target.y - bot.y) < 175;
  const edgeBlocked = !!bot.aiMind.edgePoison?.blocked;
  const frustrated = !!bot.aiMind.frustration?.frustrated;
  law.reason = reasonFor({ near, edgeBlocked, frustrated, idleFrames: law.idleFrames, anti: world.antiPeace?.active });
  law.mustMove = !!law.reason;
  law.moveDir = movementFor(bot, world, law.reason);
  if (law.mustMove) law.corrections++;
  return { ...law };
}

function idleNow(bot) {
  return !bot.attack && !bot.rapidAttack && bot.stun <= 0 && Math.abs(bot.vx || 0) < 0.35 && Math.abs(bot.input?.x || 0) < 0.08;
}

function reasonFor(flags) {
  if (flags.edgeBlocked) return 'edgeLoop';
  if (flags.frustrated) return 'frustrated';
  if (flags.near && flags.idleFrames > 18) return 'nearEnemy';
  if (flags.anti && flags.idleFrames > 14) return 'antiPeace';
  if (flags.idleFrames > 90) return 'idle';
  return '';
}

function movementFor(bot, world, reason) {
  if (reason === 'edgeLoop') return bot.aiMind.edgePoison?.escapeDir || Math.sign(world.current.safe.center - bot.x || 1);
  if (reason === 'frustrated') return Math.sign(world.target.x - bot.x || bot.face || 1);
  if (reason === 'nearEnemy') return crossUpDir(bot, world);
  if (reason === 'antiPeace') return Math.sign(world.target.x - bot.x || 1);
  return bot.face || 1;
}

function crossUpDir(bot, world) {
  const toTarget = Math.sign(world.target.x - bot.x || bot.face || 1);
  return bot.aiMind.frustration?.forceCrossUp ? toTarget : -toTarget;
}

function freshLaw() {
  return { idleFrames: 0, mustMove: false, moveDir: 1, reason: '', corrections: 0 };
}
