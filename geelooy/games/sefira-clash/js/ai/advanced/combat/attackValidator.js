/**
 * B"H
 * Attack validity gate.
 *
 * Chapter 42: the NPC may not swing merely because desire is near. The Awtsmoos
 * asks whether the enemy will still be there after startup, whether the face is
 * correct, whether the platform lane agrees, and whether this attack recently
 * failed into emptiness.
 */
export function validateAttack(bot, world, tactic) {
  const target = world.target;
  const memory = bot.aiMind?.memory || {};
  const predicted = predictTarget(target, startupFor(tactic));
  const dx = predicted.x - bot.x;
  const dy = predicted.y - bot.y;
  const facing = Math.sign(dx || bot.face || 1) === Math.sign(tactic.aimX || bot.face || 1);
  const lane = Math.abs(dy) < laneHeight(tactic);
  const range = Math.abs(dx) < rangeFor(tactic, bot);
  const whiff = memory.whiffs?.[tactic.kind] || 0;
  const blocked = world.wall?.blocked && Math.abs(dx) > 80;
  const valid = facing && lane && range && !blocked && whiff < 55;
  return { valid, predicted, facing, lane, range, blocked, whiff, reason: reason(valid, facing, lane, range, blocked, whiff) };
}

export function attackKey(world) {
  return world.combatTactic?.kind || 'Attack';
}

function predictTarget(target, frames) {
  return { x: target.x + (target.vx || 0) * frames, y: target.y + (target.vy || 0) * frames };
}

function startupFor(tactic) {
  if (tactic.instant) return tactic.button === 'grab' ? 7 : 4;
  if (tactic.kind?.includes('Charge')) return 18;
  return 6;
}

function rangeFor(tactic, bot) {
  if (tactic.button === 'grab') return 98;
  if (tactic.button === 'kick' || tactic.kind?.includes('Kick')) return bot.attack ? 158 : 145;
  if (tactic.kind?.includes('Charge')) return 178;
  return 132;
}

function laneHeight(tactic) {
  if (tactic.kind === 'AntiAir') return 235;
  if (Math.abs(tactic.aimY || 0) > 0.4) return 205;
  return 135;
}

function reason(valid, facing, lane, range, blocked, whiff) {
  if (valid) return 'valid';
  if (!facing) return 'wrongFace';
  if (!lane) return 'wrongLane';
  if (!range) return 'outOfRange';
  if (blocked) return 'wallBlocked';
  if (whiff >= 55) return 'recentWhiff';
  return 'invalid';
}
