import { goalX, steer } from './goals.js';

/**
 * B"H
 * Bot executor with descent commitment.
 *
 * Chapter 229: planned descent must bypass both safety correction and safety
 * steering. Otherwise the bot sees the correct edge-door but its feet are still
 * dragged back to the safe center. Now the route owns the feet until the fall.
 */
export function executeIntent(bot, w, intent) {
  init(bot);
  tickPlans(bot);
  const descent = isDescentRoute(w, intent);
  const goal = goalX(bot, w, intent);
  const rawX = steer(bot, goal, intent, w.crowdPush, descent ? null : w.safety);
  const safeX = edgeCorrect(bot, w, rawX, intent);
  const attack = attackPlan(bot, w, intent);
  const x = movementFor(bot, w, safeX, attack, intent);
  const jump = wantsJump(bot, w, intent, goal);
  if (jump) bot.ai.jumpCooldown = intent === 'recover' ? 10 : 18;
  const drop = wantsDrop(bot, w, intent, goal);
  return {
    x,
    aimX: Math.sign(w.dx || x || bot.face || 1),
    aimY: aimYFor(w, intent),
    y: drop ? 1 : aimYFor(w, intent),
    down: drop,
    jump,
    shield: wantsShield(bot, w, intent),
    grab: attack.release && w.target.blocking && w.dist < 95,
    punch: attack.kind === 'punch',
    kick: attack.kind === 'kick',
    special: wantsSpecial(bot, attack.release, intent)
  };
}

function init(bot) {
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown || 0);
  bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown || 0);
  bot.ai.chargePlan ||= null;
  bot.ai.steerCommit ||= { x: 0, t: 0 };
}

function tickPlans(bot) {
  bot.ai.jumpCooldown = Math.max(0, bot.ai.jumpCooldown - 1);
  bot.ai.attackCooldown = Math.max(0, bot.ai.attackCooldown - 1);
  if (bot.ai.steerCommit.t > 0) bot.ai.steerCommit.t--;
}

function movementFor(bot, w, safeX, attack, intent) {
  if (w.safety?.danger && !isDescentRoute(w, intent)) return edgeCorrect(bot, w, safeX, 'edgeSafe');
  if (attack.kind !== 'none' && w.route?.same && w.dist < 175) return holdCombatPocket(bot, w, safeX);
  return commitX(bot, safeX);
}

function commitX(bot, x) {
  if (Math.abs(x) < 0.05) return 0;
  const sx = Math.sign(x);
  if (bot.ai.steerCommit.t <= 0 || bot.ai.steerCommit.x === 0) bot.ai.steerCommit = { x: sx, t: 24 };
  if (sx !== bot.ai.steerCommit.x && bot.ai.steerCommit.t > 0) return bot.ai.steerCommit.x * Math.abs(x);
  bot.ai.steerCommit = { x: sx, t: 24 };
  return x;
}

function holdCombatPocket(bot, w, x) {
  if (w.dist < 78) return -Math.sign(w.dx || bot.face || 1) * 0.45;
  if (w.dist > 148) return commitX(bot, x);
  return 0;
}

function attackPlan(bot, w, intent) {
  if (bot.ai.chargePlan && shouldCancelCharge(bot, w, intent)) bot.ai.chargePlan = null;
  const plan = bot.ai.chargePlan;
  if (plan) return continuePlan(bot, plan);
  if (!w.combat?.canHitNow) return { kind: 'none', release: false };
  if (!wantsAttack(bot, w, intent)) return { kind: 'none', release: false };
  const kind = prefersPunch(intent, w) ? 'punch' : 'kick';
  const hold = shouldFullCharge(bot, w, intent) ? 84 : 7 + Math.floor(Math.random() * 12);
  bot.ai.chargePlan = { kind, hold, age: 0, release: false };
  return { kind, release: false };
}

function shouldCancelCharge(bot, w, intent) {
  if (intent === 'recover') return true;
  if (!w.route?.same && w.dist > 240) return true;
  if (Math.abs(w.dx) > 390 || Math.abs(w.dy) > 280) return true;
  if (w.combat && !w.combat.canHitNow && !w.combat.reachableGround) return true;
  return bot.stun > 0 || bot.dead;
}

function continuePlan(bot, plan) {
  plan.age++;
  if (plan.release) {
    bot.ai.chargePlan = null;
    bot.ai.attackCooldown = plan.hold > 60 ? 52 : 20;
    return { kind: 'none', release: true };
  }
  if (plan.age >= plan.hold) {
    plan.release = true;
    return { kind: 'none', release: true };
  }
  return { kind: plan.kind, release: false };
}

function shouldFullCharge(bot, w, intent) {
  if (w.dist < 95 || w.dist > 275) return false;
  if (!w.route?.same || !w.combat?.reachableGround) return false;
  if (bot.damage > 135) return false;
  return ['pressure', 'ledgeTrap', 'bait'].includes(intent) && !w.target.attack;
}

function edgeCorrect(bot, w, x, intent) {
  if (!w.safety?.danger || intent === 'denyRecovery' || intent === 'ledgeTrap' || isDescentRoute(w, intent)) return x;
  const movingOut = Math.sign(x || bot.vx || 0) === -w.safety.inward;
  if (!movingOut && Math.abs(x) > 0.01) return x;
  return w.safety.inward || x;
}

function wantsAttack(bot, w, intent) {
  if (bot.ai.attackCooldown > 0 || bot.attack) return false;
  if (intent === 'edgeSafe' || intent === 'recover' || intent === 'route') return false;
  if (!w.route?.same && intent !== 'denyRecovery') return false;
  if (w.safety?.danger && w.dist > 125 && intent !== 'denyRecovery' && intent !== 'ledgeTrap') return false;
  if (intent === 'brawl') return w.combat?.canHitNow && w.dist < 185;
  if (intent === 'pressure') return w.combat?.canHitNow && w.dist < 240;
  if (intent === 'punish') return w.combat?.canHitNow && w.dist < 275;
  if (intent === 'denyRecovery') return w.dist < 255;
  if (intent === 'ledgeTrap') return w.dist < 145;
  return w.combat?.canHitNow && w.dist < 150 && (intent === 'approach' || intent === 'bait');
}

function wantsJump(bot, w, intent, goal) {
  if (bot.ai.jumpCooldown > 0) return false;
  if (!bot.grounded && intent !== 'recover' && intent !== 'denyRecovery') return false;
  if (intent === 'recover') return pulseJump(bot, 'recover', 10);
  if (intent === 'edgeSafe' || w.safety?.danger) return false;
  const routeJump = w.route?.needsJump && nearLaunchPoint(bot, goal);
  const verticalChase = w.combat?.aboveLane && nearLaunchPoint(bot, goal);
  if (routeJump || verticalChase) return pulseJump(bot, routeKey(w), 16);
  if (intent === 'unstick' && bot.grounded && bot.ai.stuck > 42) return pulseJump(bot, 'unstick', 18);
  return false;
}

function wantsDrop(bot, w, intent, goal) {
  if (!bot.grounded || w.safety?.danger && !isDescentRoute(w, intent)) return false;
  if (intent === 'edgeSafe' || intent === 'recover') return false;
  if (!(w.route?.needsDrop || w.combat?.belowLane)) return false;
  return Math.abs((goal ?? bot.x) - bot.x) < 74;
}

function isDescentRoute(w, intent) {
  return intent === 'route' && !!w.route?.needsDrop;
}

function nearLaunchPoint(bot, goal) {
  return Math.abs((goal ?? bot.x) - bot.x) < 82;
}

function pulseJump(bot, key, gap) {
  bot.ai.lastJumpKey ||= '';
  bot.ai.lastJumpPulse ||= -999;
  const ok = bot.ai.lastJumpKey !== key || bot.ai.clock - bot.ai.lastJumpPulse > gap;
  if (!ok) return false;
  bot.ai.lastJumpKey = key;
  bot.ai.lastJumpPulse = bot.ai.clock;
  return true;
}

function routeKey(w) {
  return `${w.route?.current?.x || 0}:${w.route?.targetPlatform?.x || 0}:${w.route?.action || ''}`;
}

function wantsShield(bot, w, intent) {
  if (bot.ai.chargePlan) return false;
  if (intent === 'ledgeTrap') return w.dist > 90 || bot.ai.clock % 5 !== 0;
  return intent === 'bait' && w.target.attack && w.dist < 165 && bot.ai.clock % 4 !== 0;
}

function wantsSpecial(bot, releasing, intent) {
  return intent === 'recover' || (releasing && !!bot.heldWeapon && bot.ai.clock % 2 === 0);
}

function prefersPunch(intent, w) {
  if (intent === 'denyRecovery') return false;
  if (w.dy > 70 || w.target.y > w.floor.y + 40) return false;
  return intent === 'punish' || intent === 'brawl' || w.dist < 120;
}

function aimYFor(w, intent) {
  if (intent === 'denyRecovery') return 1;
  if (w.dy < -110) return -1;
  if (w.dy > 140) return 1;
  return 0;
}
