import { goalX, steer } from './goals.js';

/**
 * B"H
 * Bot input executor, aggression repair.
 *
 * Chapter 84: when close, bots attack. Not maybe, not after a pilgrimage to a
 * power-up, not after staring at a ledge. They pulse buttons like fighters and
 * let the combat engine decide the move.
 */
export function executeIntent(bot, w, intent) {
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown || 0);
  bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown || 0);
  const goal = goalX(bot, w, intent);
  const x = steer(bot, goal, intent, w.crowdPush);
  const shouldAttack = wantsAttack(bot, w, intent);
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown - 1);
  bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown - 1);
  if (shouldAttack) bot.ai.attackCooldown = attackCooldown(intent);
  const jump = wantsJump(bot, w, intent);
  if (jump) bot.ai.jumpCooldown = intent === 'recover' ? 12 : 26;
  return {
    x,
    y: intent === 'denyRecovery' ? 1 : 0,
    down: intent === 'denyRecovery',
    jump,
    shield: wantsShield(bot, w, intent),
    grab: shouldAttack && w.target.blocking && w.dist < 95,
    punch: shouldAttack && prefersPunch(intent, w),
    kick: shouldAttack && !prefersPunch(intent, w),
    special: wantsSpecial(bot, shouldAttack, intent)
  };
}

function wantsAttack(bot, w, intent) {
  if (bot.ai.attackCooldown > 0 || bot.attack) return false;
  if (intent === 'brawl') return w.dist < 150;
  if (intent === 'pressure') return w.dist < 185;
  if (intent === 'punish') return w.dist < 235;
  if (intent === 'denyRecovery') return w.dist < 250;
  if (intent === 'ledgeTrap') return w.dist < 115;
  return w.dist < 120 && (intent === 'approach' || intent === 'bait');
}

function attackCooldown(intent) {
  if (intent === 'brawl') return 18;
  if (intent === 'punish' || intent === 'denyRecovery') return 14;
  return 24;
}

function wantsJump(bot, w, intent) {
  if (bot.ai.jumpCooldown > 0) return false;
  if (!bot.grounded && intent !== 'recover' && intent !== 'denyRecovery') return false;
  if (intent === 'recover') return bot.ai.clock % 10 < 2;
  if (intent === 'unstick') return bot.grounded && bot.ai.stuck > 48;
  if (intent === 'denyRecovery') return bot.grounded && w.target.y > bot.y + 55;
  if (intent === 'perch' && w.territory?.perch?.y < bot.y - 95) return true;
  if (w.nav?.shouldJump && Math.abs(w.dx) < 380 && w.dy < -130) return true;
  return false;
}

function wantsShield(bot, w, intent) {
  if (intent === 'ledgeTrap') return w.dist > 90 || bot.ai.clock % 5 !== 0;
  return intent === 'bait' && w.target.attack && w.dist < 165 && bot.ai.clock % 4 !== 0;
}

function wantsSpecial(bot, attacking, intent) {
  return intent === 'recover' || (attacking && !!bot.heldWeapon && bot.ai.clock % 2 === 0);
}

function prefersPunch(intent, w) {
  if (intent === 'denyRecovery') return false;
  if (w.dy > 70 || w.target.y > w.floor.y + 40) return false;
  return intent === 'punish' || intent === 'brawl' || w.dist < 105;
}
