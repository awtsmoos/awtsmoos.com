/**
 * B"H
 * Jump discipline.
 *
 * Chapter 43: no leap may be nameless. The bot must know whether it is rising
 * for route, recovery, escape, or anti-air. Failed leap memories close that
 * gate briefly so circles of pointless jumping dissolve.
 */
export function jumpDecision(bot, world, reason) {
  const memory = bot.aiMind?.memory || {};
  if (!reason || reason === 'None') return deny('noReason');
  if (memory.failedJumps?.[reason]) return deny('failedRecently');
  if (samePlatformCombat(bot, world, reason)) return deny('samePlatformCombat');
  if (tooSoon(bot, reason)) return deny('cooldown');
  return { allow: true, reason };
}

export function jumpGap(reason) {
  if (reason === 'RecoverJump') return 14;
  if (reason === 'EscapeJump') return 18;
  if (reason === 'AntiAirJump') return 30;
  return 34;
}

export function classifyJumpReason(state, world) {
  if (state === 'RecoverLow' || state === 'RecoverHigh') return 'RecoverJump';
  if (state?.startsWith('Escape')) return 'EscapeJump';
  if (state === 'PlatformAscend') return 'RouteJump';
  if (world.combat?.shouldAntiAir && !world.combat?.sameFightingLane) return 'AntiAirJump';
  return 'None';
}

function samePlatformCombat(bot, world, reason) {
  return reason !== 'AntiAirJump' && world.current?.id === world.goal?.id && world.combat?.sameFightingLane && world.combat?.canHitNow;
}

function tooSoon(bot, reason) {
  const last = bot.aiMind?.lastJumpAtByReason?.[reason] ?? -999;
  const age = (bot.aiMind?.clock || 0) - last;
  return age < jumpGap(reason);
}

function deny(reason) {
  return { allow: false, reason };
}
