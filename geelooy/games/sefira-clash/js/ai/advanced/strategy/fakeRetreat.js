/**
 * B"H
 * Fake retreat.
 *
 * Chapter 120: the bot learns one very human trick: step back, let hunger pull
 * the enemy forward, then reverse. It is tiny, short, and never allowed to
 * cancel a guaranteed hit.
 */
export function updateFakeRetreat(bot, world) {
  bot.aiMind ||= {};
  bot.aiMind.fakeRetreat ||= { active: false, reverse: false, frames: 0, cooldown: 0, activations: 0 };
  const f = bot.aiMind.fakeRetreat;
  f.cooldown = Math.max(0, f.cooldown - 1);
  if (!f.active && shouldStart(bot, world, f)) start(f);
  if (f.active) step(f);
  const away = -Math.sign(world.target.x - bot.x || bot.face || 1);
  return { ...f, moveX: f.reverse ? -away : away };
}

function shouldStart(bot, world, f) {
  if (f.cooldown > 0 || world.combat?.canHitNow || world.execution?.active) return false;
  if (world.threatVision?.panic) return false;
  const close = Math.abs(world.target.x - bot.x) < 260 && Math.abs(world.target.y - bot.y) < 150;
  return close && world.hunger?.value > 52 && world.momentum?.winning && (bot.aiMind.clock || 0) % 180 === 0;
}

function start(f) { f.active = true; f.reverse = false; f.frames = 0; f.activations++; }
function step(f) { f.frames++; if (f.frames > 22) f.reverse = true; if (f.frames > 42) { f.active = false; f.cooldown = 260; } }
