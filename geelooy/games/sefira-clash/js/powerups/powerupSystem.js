import { circleHit } from '../core/collision.js';
import { applyPickupEffect } from './effects/applyPickupEffect.js';
import { tickBuffs } from './effects/buffTimers.js';
import { applyMagneticPull } from './effects/magneticPull.js';

/** B"H - Power-up system with guaranteed contested stage-born resolution. */
export function stepPowerups(state) {
  tickBuffs(state.fighters);
  applyMagneticPull(state);
  for (let i = 0; i < state.powerups.length; i++) stepOrb(state, state.powerups[i]);
}

function stepOrb(state, orb) {
  orb.bob += 0.08;
  if (!orb.active) return tickRespawn(orb);
  if (orb.stageBorn) orb.age = (orb.age || 0) + 1;
  const radius = orb.stageBorn ? 112 : 54;
  for (const f of state.fighters) {
    if (f.dead || !circleHit(orb, { x: f.x, y: f.y - 88 }, radius)) continue;
    collect(state, f, orb);
    return;
  }
  if (orb.stageBorn && orb.age > 210) collect(state, nearestFighter(state, orb), orb);
}

function tickRespawn(orb) { if (orb.stageBorn) return; orb.respawn--; if (orb.respawn <= 0) orb.active = true; }
function collect(state, f, orb) {
  if (!f) return;
  applyPickupEffect(state, f, orb);
  orb.active = false;
  orb.respawn = orb.stageBorn ? 0 : 720;
  if (orb.stageBorn) {
    state.stageDirector.itemsPickedUp = (state.stageDirector.itemsPickedUp || 0) + 1;
    state.stageDirector.lastPickupFrame = state.frame;
    state.stageDirector.lastPickupRole = orb.role || 'unknown';
  }
  state.events.push({ type: 'pickup', fighterId: f.id, actorId: f.id, human: !!f.human, x: orb.x, y: orb.y, color: orb.color, letter: orb.letter, damage: 0, storyBeat: orb.stageBorn ? 'relicClaim' : undefined });
}
function nearestFighter(state, orb) { return state.fighters.filter(f => !f.dead && !f.hidden).sort((a, b) => Math.hypot(a.x - orb.x, a.y - orb.y) - Math.hypot(b.x - orb.x, b.y - orb.y))[0]; }
