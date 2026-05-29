// B"H
const PLAYER_HEIGHT = 48;
const PLAYER_WIDTH = 34;
const MIN_HEADROOM = PLAYER_HEIGHT + 24;
const MIN_SPIKE_WARNING = 0.95;
const MAX_ITERATIONS = 32;
const ITEM_SIZE = 26;
const SIDE_LANE = 36;
const SLOT_X_MARGIN = PLAYER_WIDTH * 1.5;
const NON_SOLID_TRICKS = new Set(['falseSpike', 'ghostSpike', 'phantom', 'commitSpike']);
const HAZARD_TRICKS = new Set(['falseSpike', 'ghostSpike', 'commitSpike']);
const horizontalGap = (a, b) => a.x + a.w < b.x ? b.x - (a.x + a.w) : b.x + b.w < a.x ? a.x - (b.x + b.w) : 0;
const nearX = (a, b, margin = SLOT_X_MARGIN) => horizontalGap(a, b) <= margin;
const bottomOf = body => body.y + body.h;
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const itemBody = item => ({ x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE });
const itemPoint = item => ({ x: item.x, y: item.y, w: ITEM_SIZE, h: ITEM_SIZE });

/**
 * Chapter 31: The Awtsmoos repaired the repair until it stopped moving.
 *
 * Freeing a coin from one surface can place it inside another cramped passage.
 * Therefore fairness is now iterative: slot clearance, hazard separation, item
 * freedom, then slot clearance again, until the composed chamber becomes still.
 * Close jump-over obstacles remain legal unless content invites the player into
 * their narrow air.
 *
 * @param {object} level Mutable level clone.
 * @returns {object} The same level after human fairness repair.
 */
export function applyHumanFairness(level) {
  const hazards = hazardBodies(level);
  for (let pass = 0; pass < MAX_ITERATIONS; pass += 1) {
    const before = snapshot(level);
    const solids = solidBodies(level);
    liftOccupiedCrampedSlots(solids, occupiedBodies(level));
    separateHazardsFromSolids(hazards, solids);
    liftEmbeddedItems(level, [...solidBodies(level), ...hazards]);
    if (snapshot(level) === before) break;
  }
  cleanseSpikeList(level.spikes || []);
  for (const trigger of level.triggers || []) cleanseTrigger(trigger, solidBodies(level));
  return level;
}

/** @param {object} level Level clone. @returns {string} Compact mutation fingerprint. */
function snapshot(level) {
  const bodies = [...(level.platforms || []), ...(level.trickPlatforms || []), ...(level.coins || []), ...(level.keys || []), ...(level.fakeCoins || [])];
  return bodies.map(body => `${body.x}:${body.y}:${body.w || 0}:${body.h || 0}`).join('|');
}

/** @param {object} level Level clone. @returns {Array<object>} Collision bodies. */
function solidBodies(level) {
  return [...(level.platforms || []), ...(level.trickPlatforms || []).filter(trick => !NON_SOLID_TRICKS.has(trick.kind))];
}

/** @param {object} level Level clone. @returns {Array<object>} Hazard bodies. */
function hazardBodies(level) {
  return [...(level.spikes || []), ...(level.trickPlatforms || []).filter(trick => HAZARD_TRICKS.has(trick.kind))];
}

/** @param {object} level Level clone. @returns {Array<object>} Places a player is invited to occupy. */
function occupiedBodies(level) {
  return [
    ...(level.coins || []).map(itemPoint),
    ...(level.keys || []).map(itemPoint),
    ...(level.fakeCoins || []).map(itemPoint),
    ...(level.trickCoins || []).map(itemPoint),
    ...(level.triggers || []).map(trigger => ({ x: trigger.x, y: trigger.y, w: trigger.w, h: trigger.h })),
    level.door ? { x: level.door.x, y: level.door.y, w: level.door.w, h: level.door.h } : null
  ].filter(Boolean);
}

/** @param {Array<object>} solids Solid rectangles. @param {Array<object>} occupants Occupied bodies. @returns {void} */
function liftOccupiedCrampedSlots(solids, occupants) {
  for (let pass = 0; pass < MAX_ITERATIONS; pass += 1) {
    let changed = false;
    for (const lower of solids) for (const upper of solids) {
      if (lower === upper || upper.y >= lower.y) continue;
      if (!nearX(lower, upper)) continue;
      const clearance = lower.y - bottomOf(upper);
      if (clearance <= 0 || clearance >= MIN_HEADROOM) continue;
      if (!slotHasOccupant(lower, upper, occupants)) continue;
      upper.y = lower.y - upper.h - MIN_HEADROOM;
      changed = true;
    }
    if (!changed) return;
  }
}

/** @param {object} lower Lower solid. @param {object} upper Upper solid. @param {Array<object>} occupants Content bodies. @returns {boolean} */
function slotHasOccupant(lower, upper, occupants) {
  const left = Math.min(lower.x, upper.x) - PLAYER_WIDTH;
  const right = Math.max(lower.x + lower.w, upper.x + upper.w) + PLAYER_WIDTH;
  const top = bottomOf(upper);
  const bottom = lower.y;
  return occupants.some(body => body.x + body.w > left && body.x < right && body.y + body.h > top && body.y < bottom);
}

/** @param {Array<object>} hazards Hazards. @param {Array<object>} solids Solids. @returns {void} */
function separateHazardsFromSolids(hazards, solids) {
  for (const hazard of hazards) for (let pass = 0; pass < MAX_ITERATIONS; pass += 1) {
    const solid = solids.find(body => hit(hazard, body));
    if (!solid) break;
    hazard.x = solid.x + solid.w + SIDE_LANE;
    hazard.baseX = hazard.x;
  }
}

/** @param {object} level Level clone. @param {Array<object>} blockers Solids and hazards. @returns {void} */
function liftEmbeddedItems(level, blockers) {
  for (const list of itemLists(level)) for (const item of list) liftItemUntilFree(item, blockers);
  for (const trigger of level.triggers || []) for (const list of itemLists(trigger)) for (const item of list) liftItemUntilFree(item, blockers);
}

/** @param {object} vessel Any object with item lists. @returns {Array<Array<object>>} Item lists. */
function itemLists(vessel) { return [vessel.coins || [], vessel.keys || [], vessel.fakeCoins || [], vessel.trickCoins || []]; }

/** @param {object} item Item payload. @param {Array<object>} blockers Blocking bodies. @returns {void} */
function liftItemUntilFree(item, blockers) {
  for (let pass = 0; pass < MAX_ITERATIONS; pass += 1) {
    const blocker = blockers.find(body => hit(itemBody(item), body));
    if (!blocker) return;
    item.y = blocker.y - ITEM_SIZE - 8;
  }
}

/** @param {object} trigger Trigger payload. @param {Array<object>} solids Solids. @returns {void} */
function cleanseTrigger(trigger, solids) {
  cleanseSpikeList(trigger.spikes || []);
  separateHazardsFromSolids(trigger.spikes || [], solids);
  for (const nested of trigger.triggers || []) cleanseTrigger(nested, solids);
}

/** @param {Array<object>} spikes Spike payloads. @returns {void} */
function cleanseSpikeList(spikes) { for (const spike of spikes) if (needsWarning(spike)) cleanseSpike(spike); }

/** @param {object} spike Spike payload. @returns {boolean} Whether it can surprise. */
function needsWarning(spike) { return Boolean(spike.proximity || spike.instant || spike.fallSpeed || spike.orbitR || spike.moveX || spike.moveY || spike.rollSpeed); }

/** @param {object} spike Spike payload. @returns {void} */
function cleanseSpike(spike) {
  spike.instant = false;
  spike.showDormant = true;
  spike.warning = Math.max(Number(spike.warning ?? MIN_SPIKE_WARNING), MIN_SPIKE_WARNING);
  spike.safe = Math.max(Number(spike.safe ?? 120), 120);
}
