import { storyLine } from './stageVoiceLines.js';
import { canSpeak, decayZoneHeat, ensureStageStory, recordRivalHit, recordZoneHeat, tickStoryCooldowns } from './stageStoryMemory.js';

/**
 * B"H
 * Stage story event detector.
 *
 * Chapter 171: this is the bard hidden inside the arena. It watches the raw
 * combat stream and chooses only the sharpest beats: heavy blows, revenge,
 * rivalries, relic claims, stage wrath, objective claims, and dominance zones.
 */
export function stepStageStory(state) {
  const story = ensureStageStory(state);
  tickStoryCooldowns(story);
  decayZoneHeat(story);
  markStageCounters(state, story);
  markDanger(state, story);
  markEvents(state, story, [...state.events]);
  markDominance(state, story);
}

function markStageCounters(state, story) {
  const counts = stageCounts(state);
  compareCounter(state, story, counts, 'itemsSpawned', 'relicSpawn');
  compareCounter(state, story, counts, 'itemsPickedUp', 'relicClaim');
  compareCounter(state, story, counts, 'hazardsSpawned', 'hazardSpawn');
  compareCounter(state, story, counts, 'hazardHits', 'hazardHit');
  compareCounter(state, story, counts, 'objectiveSpawns', 'objectiveOpen');
  compareCounter(state, story, counts, 'objectiveClaims', 'objectiveClaim');
  story.lastCounts = counts;
}

function compareCounter(state, story, counts, key, line) {
  if ((counts[key] || 0) <= (story.lastCounts[key] || 0)) return;
  const p = centerOfBattle(state);
  speak(state, story, line, p.x, p.y - 130, 150);
}

function markEvents(state, story, events) {
  for (const e of events) {
    if (e.type !== 'hit') continue;
    recordZoneHeat(story, state, e.x || 0, e.y || 0, Math.max(1, (e.force || 0) / 12));
    if (e.attackerId && e.targetId && e.attackerId !== 'stage') markRivalry(state, story, e);
    if ((e.force || 0) >= 34 && !e.rapid) speak(state, story, 'heavyHit', e.x, e.y - 42, 120);
    if ((e.force || 0) >= 48 || e.koDanger || e.fullCharge) speak(state, story, 'launchHit', e.x, e.y - 72, 170);
    if (e.attackerId === 'stage') speak(state, story, 'hazardHit', e.x, e.y - 60, 90);
  }
}

function markRivalry(state, story, e) {
  const result = recordRivalHit(story, e.attackerId, e.targetId);
  if (result.revenge) speak(state, story, 'revenge', e.x, e.y - 88, 200);
  if (result.rivalry) speak(state, story, 'rivalry', e.x, e.y - 116, 280);
}

function markDanger(state, story) {
  for (const f of state.fighters) {
    if (f.dead || f.hidden || f.damage < 125 || story.danger.has(f.id)) continue;
    story.danger.add(f.id);
    speak(state, story, f.stocks <= 1 ? 'lastStand' : 'danger', f.x, f.y - 128, 160);
  }
}

function markDominance(state, story) {
  if (state.frame % 180 !== 0) return;
  let best = null;
  for (const [key, zone] of Object.entries(story.zoneHeat)) {
    if (!best || zone.heat > best.heat) best = { key, ...zone };
  }
  if (!best || best.heat < 24) return;
  speak(state, story, 'dominance', best.x / Math.max(1, best.samples), best.y / Math.max(1, best.samples) - 90, 360);
}

function speak(state, story, name, x, y, cooldown) {
  if (!canSpeak(story, name, cooldown)) return;
  const line = storyLine(name);
  state.events.push({ type: 'narrative', x, y, text: line.text, color: line.color, storyBeat: name });
}

function stageCounts(state) {
  const d = state.stageDirector || {};
  return {
    itemsSpawned: d.itemsSpawned || 0,
    itemsPickedUp: d.itemsPickedUp || 0,
    hazardsSpawned: d.hazardsSpawned || 0,
    hazardHits: d.hazardHits || 0,
    objectiveSpawns: d.objectiveSpawns || 0,
    objectiveClaims: d.objectiveClaims || 0
  };
}

function centerOfBattle(state) {
  const alive = state.fighters.filter(f => !f.dead && !f.hidden);
  if (!alive.length) return { x: 0, y: 0 };
  return { x: alive.reduce((s, f) => s + f.x, 0) / alive.length, y: alive.reduce((s, f) => s + f.y, 0) / alive.length };
}
