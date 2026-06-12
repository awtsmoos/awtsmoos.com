/**
 * B"H
 * Action memory.
 *
 * Chapter 41: the NPC remembers consequences. A whiff becomes a warning, a
 * failed jump becomes forbidden ground, and a repeated route becomes a door the
 * Awtsmoos asks it not to knock on again immediately.
 */
export function updateActionMemory(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.memory ||= freshMemory();
  decay(bot.aiMind.memory);
  observeAttackEnd(bot, world);
  observeJumpResult(bot, world);
  return bot.aiMind.memory;
}

export function rememberIssuedJump(bot, reason, x, y) {
  bot.aiMind ||= {};
  bot.aiMind.memory ||= freshMemory();
  bot.aiMind.memory.pendingJump = { reason, x, y, frame: bot.aiMind.clock || 0 };
}

export function rememberIssuedAttack(bot, attackKey) {
  bot.aiMind ||= {};
  bot.aiMind.memory ||= freshMemory();
  bot.aiMind.memory.lastIssuedAttack = attackKey;
}

export function markRouteFailure(bot, world, reason) {
  const memory = bot.aiMind?.memory || freshMemory();
  const key = routeKey(world);
  memory.routeFails[key] = Math.max(memory.routeFails[key] || 0, reason === 'stuck' ? 100 : 60);
}

export function routeFailureScore(bot, world) {
  return bot.aiMind?.memory?.routeFails?.[routeKey(world)] || 0;
}

function observeAttackEnd(bot, world) {
  const previous = bot.aiMind.memory.attackWasLive;
  const live = bot.attack || bot.rapidAttack;
  if (live) {
    bot.aiMind.memory.attackWasLive = true;
    bot.aiMind.memory.attackHitDuringLive ||= attackHasHit(live);
    return;
  }
  if (!previous) return;
  const key = bot.aiMind.memory.lastIssuedAttack || world.combatTactic?.kind || 'unknown';
  const hit = bot.aiMind.memory.attackHitDuringLive;
  bot.aiMind.memory.whiffs[key] = hit ? Math.max(0, (bot.aiMind.memory.whiffs[key] || 0) - 20) : 75;
  bot.aiMind.memory.lastAttackHit = !!hit;
  bot.aiMind.memory.attackWasLive = false;
  bot.aiMind.memory.attackHitDuringLive = false;
}

function observeJumpResult(bot, world) {
  const jump = bot.aiMind.memory.pendingJump;
  if (!jump) return;
  const age = (bot.aiMind.clock || 0) - jump.frame;
  if (age < 28) return;
  const displacement = Math.hypot(bot.x - jump.x, bot.y - jump.y);
  const samePlatform = world.current?.id === world.goal?.id;
  if (displacement < 90 || samePlatform) bot.aiMind.memory.failedJumps[jump.reason] = 90;
  bot.aiMind.memory.pendingJump = null;
}

function attackHasHit(attack) {
  return !!attack?.hasHit && attack.hasHit.size > 0;
}

function decay(memory) {
  tickMap(memory.whiffs);
  tickMap(memory.failedJumps);
  tickMap(memory.routeFails);
}

function tickMap(map) {
  for (const key of Object.keys(map)) {
    map[key] = Math.max(0, map[key] - 1);
    if (!map[key]) delete map[key];
  }
}

function routeKey(world) {
  return `${world.current?.id ?? 'x'}>${world.goal?.id ?? 'x'}:${world.step?.action || 'none'}`;
}

function freshMemory() {
  return { whiffs: {}, failedJumps: {}, routeFails: {}, lastIssuedAttack: '', attackWasLive: false, attackHitDuringLive: false, lastAttackHit: false, pendingJump: null };
}
