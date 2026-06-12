import { circleHit } from '../core/collision.js';
import { applyPickupEffect } from './effects/applyPickupEffect.js';
import { tickBuffs } from './effects/buffTimers.js';
import { applyMagneticPull } from './effects/magneticPull.js';

/**
 * B"H
 * Power-up system with split effects.
 *
 * Chapter 186: pickup motion, buff timers, concrete effects, and magnetic pull
 * now live in separate vessels. The match may rain power, but the loop stays
 * plain, bounded, and readable.
 */
export function stepPowerups(state) {
  tickBuffs(state.fighters);
  applyMagneticPull(state);
  for (let i = 0; i < state.powerups.length; i++) stepOrb(state, state.powerups[i]);
}

function stepOrb(state, orb) {
  orb.bob += 0.08;
  if (!orb.active) return tickRespawn(orb);
  for (let i = 0; i < state.fighters.length; i++) {
    const f = state.fighters[i];
    if (f.dead || !circleHit(orb, { x: f.x, y: f.y - 88 }, 54)) continue;
    collect(state, f, orb);
    return;
  }
}

function tickRespawn(orb) {
  if (orb.stageBorn) return;
  orb.respawn--;
  if (orb.respawn <= 0) orb.active = true;
}

function collect(state, f, orb) {
  applyPickupEffect(state, f, orb);
  orb.active = false;
  orb.respawn = orb.stageBorn ? 0 : 720;
  if (orb.stageBorn) {
    state.stageDirector.itemsPickedUp = (state.stageDirector.itemsPickedUp || 0) + 1;
    state.stageDirector.lastPickupFrame = state.frame;
    state.stageDirector.lastPickupRole = orb.role || 'unknown';
  }
  state.events.push({ type: 'pickup', fighterId: f.id, actorId: f.id, human: !!f.human, x: orb.x, y: orb.y, color: orb.color, letter: orb.letter, damage: 0 });
}
