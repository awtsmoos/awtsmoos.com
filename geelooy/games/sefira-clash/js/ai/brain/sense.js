import { crowdPush } from './crowd.js';
import { hitChance, predictTarget } from './prediction.js';
import { platformPlan } from './platformNav.js';
import { recoveryRead } from './recoveryRead.js';
import { territorySense } from './territory.js';

/**
 * B"H
 * Bot sensory snapshot.
 *
 * Chapter 66: sight becomes layered. The bot reads prediction, crowd pressure,
 * power-up temptation, weapon desire, high ground, and whether the target has
 * become a helpless recovery path waiting to be denied.
 */
export function senseWorld(bot, target, state) {
  const floor = nearestFloor(bot, state.map.platforms);
  const predicted = predictTarget(target, 16);
  const dx = predicted.x - bot.x;
  const dy = predicted.y - bot.y;
  const dist = Math.hypot(dx, dy * 0.75);
  return {
    target, predicted, floor, dx, dy, dist,
    hitChance: hitChance(bot, predicted, bot.heldWeapon ? 190 : 135),
    crowdPush: crowdPush(bot, state.fighters),
    recovery: recoveryRead(target, floor),
    territory: territorySense(bot, target, floor, state.map.platforms),
    edge: edgeInfo(bot, floor),
    weapon: nearestItem(bot, state.weapons, w => !w.held),
    powerup: nearestItem(bot, state.powerups || [], p => p.active),
    whiff: !!target.attack && (target.attackFrame || 0) > target.attack.startup + target.attack.active,
    crowded: countNear(bot, state.fighters, 150),
    touching: countNear(bot, state.fighters, 58),
    nav: platformPlan(bot, floor, predicted.x, predicted.y)
  };
}

function nearestFloor(bot, platforms) {
  let best = platforms[0];
  let d = Infinity;
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const inside = bot.x >= p.x - 95 && bot.x <= p.x + p.w + 95;
    const nd = inside ? Math.abs(p.y - bot.y) : Math.abs(p.x + p.w / 2 - bot.x) + 420;
    if (nd < d) { d = nd; best = p; }
  }
  return best;
}

function edgeInfo(bot, p) {
  const left = p.x + 80;
  const right = p.x + p.w - 80;
  return { left, right, center: p.x + p.w / 2, off: bot.x < left || bot.x > right || bot.y > p.y + 95 };
}

function nearestItem(bot, items, ok) {
  let best = null;
  let d = Infinity;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!ok(item)) continue;
    const nd = Math.abs(item.x - bot.x) + Math.abs(item.y - bot.y) * 0.65;
    if (nd < d) { d = nd; best = item; }
  }
  return best;
}

function countNear(bot, fighters, radius) {
  let n = 0;
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    if (f === bot || f.dead) continue;
    if (Math.abs(f.x - bot.x) < radius && Math.abs(f.y - bot.y) < radius) n++;
  }
  return n;
}
