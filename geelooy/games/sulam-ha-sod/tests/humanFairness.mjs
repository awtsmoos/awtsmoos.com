// B"H
import assert from 'assert';
import { LEVELS } from '../js/data/levels.js';
import { SpikeOracle } from '../js/systems/spikes.js';

const PLAYER = { w: 34, h: 48 };
const MIN_HEADROOM = PLAYER.h + 24;
const MIN_SPIKE_WARNING = 0.9;
const NEAR_SLOT = PLAYER.w * 1.5;
const NON_SOLID = new Set(['falseSpike', 'ghostSpike', 'phantom', 'commitSpike']);
const HAZARD_TRICKS = new Set(['falseSpike', 'ghostSpike', 'commitSpike']);
const horizontalGap = (a, b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const nearSlot = (a, b) => horizontalGap(a, b) <= NEAR_SLOT;
const bottomOf = body => body.y + body.h;
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const itemBody = item => ({ x: item.x, y: item.y, w: 26, h: 26 });

/**
 * Chapter 30: The Awtsmoos distinguishes obstacle from invitation.
 *
 * Close ledges may be jumped over. That is allowed. But if the level asks the
 * player to enter the space—by placing coins, keys, fake/trick coins, triggers,
 * or the door inside that slot—then the slot must fit the player body.
 */
for (const [index, level] of LEVELS.entries()) {
  const name = `${index + 1}: ${level.name}`;
  const solids = [...(level.platforms || []), ...(level.trickPlatforms || []).filter(t => !NON_SOLID.has(t.kind))];
  const hazards = [...(level.spikes || []), ...(level.trickPlatforms || []).filter(t => HAZARD_TRICKS.has(t.kind))];
  const occupants = occupiedBodies(level);
  assertOccupiedSlotHeadroom(solids, occupants, name);
  assertSeparated(solids, hazards, name);
  assertItemsFree(level, solids, hazards, name);
  for (const trigger of level.triggers || []) assertFairSpikes(trigger.spikes || [], `${name} trigger ${trigger.message || trigger.x}`);
  assertFairSpikes(level.spikes || [], `${name} level spikes`);
}

function occupiedBodies(level) {
  return [
    ...(level.coins || []).map(itemBody),
    ...(level.keys || []).map(itemBody),
    ...(level.fakeCoins || []).map(itemBody),
    ...(level.trickCoins || []).map(itemBody),
    ...(level.triggers || []).map(trigger => ({ x: trigger.x, y: trigger.y, w: trigger.w, h: trigger.h })),
    level.door ? { x: level.door.x, y: level.door.y, w: level.door.w, h: level.door.h } : null
  ].filter(Boolean);
}

function assertOccupiedSlotHeadroom(solids, occupants, name) {
  for (const lower of solids) for (const upper of solids) {
    if (upper === lower || upper.y >= lower.y || !nearSlot(lower, upper)) continue;
    const clearance = lower.y - bottomOf(upper);
    if (clearance <= 0 || clearance >= MIN_HEADROOM) continue;
    assert.ok(!slotHasOccupant(lower, upper, occupants), `${name} has collectible/interactive content in cramped slot ${clearance}px between ${JSON.stringify(lower)} and ${JSON.stringify(upper)}`);
  }
}

function slotHasOccupant(lower, upper, occupants) {
  const left = Math.min(lower.x, upper.x) - PLAYER.w;
  const right = Math.max(lower.x + lower.w, upper.x + upper.w) + PLAYER.w;
  const top = bottomOf(upper);
  const bottom = lower.y;
  return occupants.some(body => body.x + body.w > left && body.x < right && body.y + body.h > top && body.y < bottom);
}

function assertSeparated(solids, hazards, name) {
  for (const solid of solids) for (const hazard of hazards) assert.ok(!hit(solid, hazard), `${name} solid overlaps hazard ${JSON.stringify(solid)} ${JSON.stringify(hazard)}`);
}

function assertItemsFree(level, solids, hazards, name) {
  for (const item of [...(level.coins || []), ...(level.keys || []), ...(level.fakeCoins || [])]) {
    for (const solid of solids) assert.ok(!hit(itemBody(item), solid), `${name} item inside solid ${JSON.stringify(item)}`);
    for (const hazard of hazards) assert.ok(!hit(itemBody(item), hazard), `${name} item inside hazard ${JSON.stringify(item)}`);
  }
}

function assertFairSpikes(spikes, label) {
  for (const spike of spikes) {
    const needsWarning = spike.proximity || spike.instant || spike.fallSpeed || spike.orbitR || spike.moveX || spike.moveY || spike.rollSpeed;
    if (!needsWarning) continue;
    const prepared = new SpikeOracle([spike], { next: () => 0 }).traps[0];
    assert.equal(prepared.instant, false, `${label} still has instant spike ${JSON.stringify(spike)}`);
    assert.ok((prepared.warning || 0) >= MIN_SPIKE_WARNING, `${label} warning too short ${prepared.warning}`);
    assert.ok(prepared.showDormant !== false, `${label} hides dormant spike ${JSON.stringify(spike)}`);
  }
}

console.log('humanFairness: all 51 levels keep collectibles/interactions out of cramped slots while allowing jump-over obstacles');
