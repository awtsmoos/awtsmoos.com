import { goalX, steer } from './goals.js';

/**
 * B"H
 * Bot input executor.
 *
 * Chapter 69: intention becomes buttons after the new senses speak. Recovery
 * denial now prefers downward aerial pressure, ledge traps wait with shield,
 * and perch-claiming climbs instead of wandering under the sky.
 */
export function executeIntent(bot, w, intent) {
  const goal = goalX(bot, w, intent);
  const x = steer(bot, goal, intent, w.crowdPush);
  const close = w.dist < attackRange(intent) && Math.abs(w.dy) < 190;
  const confident = w.hitChance > confidence(intent);
  const release = bot.ai.hold === 1;
  if (close && confident && bot.ai.cooldown === 0 && bot.ai.hold === 0) bot.ai.hold = holdFrames(intent, w);
  const attacking = bot.ai.hold > 1;
  bot.ai.hold = Math.max(0, bot.ai.hold - 1);
  if (release) bot.ai.cooldown = intent === 'punish' || intent === 'denyRecovery' ? 12 : 18 + bot.ai.clock % 16;
  return {
    x, jump: wantsJump(bot, w, intent), shield: wantsShield(bot, w, intent), grab: release && w.target.blocking,
    punch: attacking && prefersPunch(intent, w), kick: attacking && !prefersPunch(intent, w),
    special: wantsSpecial(bot, attacking, intent)
  };
}

function attackRange(intent) {
  return intent === 'edgeguard' || intent === 'denyRecovery' ? 245 : intent === 'ledgeTrap' ? 110 : 155;
}

function confidence(intent) {
  if (intent === 'denyRecovery') return 0.25;
  if (intent === 'punish') return 0.35;
  if (intent === 'ledgeTrap') return 0.7;
  return 0.52;
}

function wantsJump(bot, w, intent) {
  if (!bot.grounded && intent !== 'recover' && intent !== 'denyRecovery') return false;
  if (intent === 'recover' || intent === 'unstick' || intent === 'separate') return true;
  if (intent === 'denyRecovery' && w.target.y > bot.y - 40) return bot.ai.clock % 12 < 4;
  if (intent === 'perch' && w.territory?.perch?.y < bot.y - 70) return bot.ai.clock % 16 < 5;
  if (w.nav?.shouldJump && bot.ai.clock % 18 < 4) return true;
  return w.dy < -115 && w.dist < 285 && bot.ai.clock % 48 < 5;
}

function wantsShield(bot, w, intent) {
  if (intent === 'ledgeTrap') return w.dist > 90 || bot.ai.clock % 5 !== 0;
  return intent === 'bait' && w.target.attack && w.dist < 165 && bot.ai.clock % 4 !== 0;
}

function wantsSpecial(bot, attacking, intent) {
  return intent === 'recover' || (attacking && !!bot.heldWeapon && bot.ai.clock % 2 === 0);
}

function holdFrames(intent, w) {
  if (intent === 'punish' || intent === 'denyRecovery') return 5;
  if (intent === 'edgeguard') return w.target.y > w.floor.y ? 18 : 8;
  if (intent === 'ledgeTrap') return 16;
  if (w.hitChance > 0.8) return 6;
  return 9 + Math.floor(Math.random() * 20);
}

function prefersPunch(intent, w) {
  if (intent === 'denyRecovery') return false;
  return intent === 'punish' || w.dist < 96 || w.dy < -90;
}
