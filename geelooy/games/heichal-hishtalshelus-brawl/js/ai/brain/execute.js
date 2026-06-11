import { goalX, steer } from './goals.js';

/**
 * B"H
 * Bot input executor.
 *
 * Chapter 75: the golem stops hopping like a broken spring. Jump becomes a
 * deliberate pulse with cooldown, only for real recovery, high platforms, or
 * clear pursuit. Attacks use press pulses, not endless held buttons.
 */
export function executeIntent(bot, w, intent) {
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown || 0);
  const goal = goalX(bot, w, intent);
  const x = steer(bot, goal, intent, w.crowdPush);
  const close = w.dist < attackRange(intent) && Math.abs(w.dy) < 190;
  const confident = w.hitChance > confidence(intent);
  const release = bot.ai.hold === 1;
  if (close && confident && bot.ai.cooldown === 0 && bot.ai.hold === 0) bot.ai.hold = holdFrames(intent, w);
  const attacking = bot.ai.hold > 1;
  bot.ai.hold = Math.max(0, bot.ai.hold - 1);
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown - 1);
  if (release) bot.ai.cooldown = intent === 'punish' || intent === 'denyRecovery' ? 12 : 18 + bot.ai.clock % 16;
  const jump = wantsJump(bot, w, intent);
  if (jump) bot.ai.jumpCooldown = intent === 'recover' ? 12 : 26;
  return {
    x,
    y: intent === 'denyRecovery' ? 1 : 0,
    down: intent === 'denyRecovery',
    jump,
    shield: wantsShield(bot, w, intent),
    grab: release && w.target.blocking,
    punch: attacking && prefersPunch(intent, w),
    kick: attacking && !prefersPunch(intent, w),
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
  if (bot.ai.jumpCooldown > 0) return false;
  if (!bot.grounded && intent !== 'recover' && intent !== 'denyRecovery') return false;
  if (intent === 'recover') return bot.ai.clock % 10 < 2;
  if (intent === 'unstick') return bot.grounded && bot.ai.stuck > 48;
  if (intent === 'separate') return false;
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
