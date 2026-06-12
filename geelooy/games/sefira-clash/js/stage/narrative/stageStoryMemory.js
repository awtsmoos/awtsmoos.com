/**
 * B"H
 * Stage story memory.
 *
 * Chapter 170: the arena remembers cause and consequence. It counts rival hits,
 * recent stage interventions, dominance zones, and rare beats so the battle can
 * tell stories without scripts or heavy logic.
 */
export function createStageStoryMemory() {
  return {
    cooldown: 0,
    danger: new Set(),
    rivalHits: {},
    lastAttacker: {},
    zoneHeat: {},
    lastCounts: { itemsSpawned: 0, itemsPickedUp: 0, hazardsSpawned: 0, hazardHits: 0, objectiveSpawns: 0, objectiveClaims: 0 },
    beats: 0,
    callouts: {}
  };
}

export function ensureStageStory(state) {
  state.story ||= createStageStoryMemory();
  return state.story;
}

export function canSpeak(story, key, cooldown = 140) {
  story.callouts[key] = Math.max(0, (story.callouts[key] || 0) - 1);
  if (story.cooldown > 0 || story.callouts[key] > 0) return false;
  story.cooldown = 38;
  story.callouts[key] = cooldown;
  story.beats++;
  return true;
}

export function tickStoryCooldowns(story) {
  story.cooldown = Math.max(0, story.cooldown - 1);
  for (const key of Object.keys(story.callouts)) story.callouts[key] = Math.max(0, story.callouts[key] - 1);
}

export function recordRivalHit(story, attackerId, targetId) {
  if (!attackerId || !targetId || attackerId === targetId) return { revenge: false, rivalry: false };
  const key = `${attackerId}->${targetId}`;
  const reverse = `${targetId}->${attackerId}`;
  story.rivalHits[key] = (story.rivalHits[key] || 0) + 1;
  const revenge = story.lastAttacker[attackerId] === targetId;
  const rivalry = (story.rivalHits[key] || 0) >= 3 && (story.rivalHits[reverse] || 0) >= 2;
  story.lastAttacker[targetId] = attackerId;
  return { revenge, rivalry };
}

export function recordZoneHeat(story, state, x, y, weight = 1) {
  const width = Math.max(1, state.map.bounds.right - state.map.bounds.left);
  const key = Math.floor(((x - state.map.bounds.left) / width) * 5);
  const zone = story.zoneHeat[key] ||= { heat: 0, x: 0, y: 0, samples: 0 };
  zone.heat += weight;
  zone.x += x;
  zone.y += y;
  zone.samples++;
  return { key, heat: zone.heat, x: zone.x / zone.samples, y: zone.y / zone.samples };
}

export function decayZoneHeat(story) {
  for (const key of Object.keys(story.zoneHeat)) {
    story.zoneHeat[key].heat *= 0.997;
    if (story.zoneHeat[key].heat < 0.7) delete story.zoneHeat[key];
  }
}
