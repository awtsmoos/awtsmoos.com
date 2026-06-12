import { chooseHazard } from './hazardRegistry.js';

/**
 * B"H
 * Hazard spawner.
 *
 * Chapter 175: hazards remain random in kind and landing, but no longer vanish
 * from an intense match by bad luck. Once the cooldown expires, chaos or long
 * silence can force the arena to drop a warned bomb, meteor, or pillar.
 */
export function maybeSpawnHazard(state) {
  state.stageDirector ||= {};
  const d = state.stageDirector;
  d.hazardCooldown = Math.max(0, (d.hazardCooldown || 0) - 1);
  if (d.hazardCooldown > 0 || (state.hazards || []).length >= 5) return null;
  if (!shouldSpawnHazard(state)) return null;
  const hazard = spawnHazard(state);
  d.hazardCooldown = 560 + Math.floor(Math.random() * 420);
  d.hazardsSpawned = (d.hazardsSpawned || 0) + 1;
  return hazard;
}

export function spawnHazard(state, forcedId = '') {
  const def = chooseHazard(state.stageMood || {});
  const spot = chooseImpactSpot(state);
  const hazard = { ...def, id: forcedId || def.id, kind: forcedId || def.id, x: spot.x, y: spot.y, timer: def.warn, active: false, hitIds: new Set(), born: state.frame };
  state.hazards.push(hazard);
  return hazard;
}

function shouldSpawnHazard(state) {
  const m = state.stageMood || {};
  if ((m.chaos || 0) > 72) return true;
  if ((m.restless || 0) > 55) return true;
  if ((m.quietFrames || 0) > 900) return true;
  return Math.random() < hazardChance(state);
}

function hazardChance(state) {
  const m = state.stageMood || {};
  return 1 / 900 + (m.restless || 0) / 70000 + (m.chaos || 0) / 90000 + (m.violence || 0) / 120000;
}

function chooseImpactSpot(state) {
  const platforms = (state.map.platforms || []).filter(p => p.w > 100);
  const focus = battleCenter(state);
  const p = nearestPlatform(platforms, focus.x) || platforms[0] || { x: focus.x - 200, y: focus.y, w: 400 };
  return { x: clamp(focus.x + rand(180), p.x + 35, p.x + p.w - 35), y: p.y - 8 };
}

function battleCenter(state) {
  const alive = state.fighters.filter(f => !f.dead && !f.hidden);
  if (!alive.length) return { x: 0, y: 0 };
  return { x: alive.reduce((s, f) => s + f.x, 0) / alive.length, y: alive.reduce((s, f) => s + f.y, 0) / alive.length };
}

function nearestPlatform(platforms, x) {
  let best = null;
  let dist = Infinity;
  for (const p of platforms) {
    const c = p.x + p.w / 2;
    const d = Math.abs(c - x);
    if (d < dist) { best = p; dist = d; }
  }
  return best;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function rand(n) { return (Math.random() * 2 - 1) * n; }
