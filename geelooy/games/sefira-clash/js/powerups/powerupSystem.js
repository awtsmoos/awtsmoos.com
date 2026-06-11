import { circleHit } from '../core/collision.js';

/**
 * B"H
 * Power-up system.
 *
 * Chapter 29: the orb touches the fighter and the rule of the body changes.
 * Buffs tick down, picked-up lights sleep, and the arena restores them later
 * so the match keeps producing decisions instead of dead empty space.
 */
export function stepPowerups(state) {
  tickBuffs(state.fighters);
  for (let i = 0; i < state.powerups.length; i++) stepOrb(state, state.powerups[i]);
}

function tickBuffs(fighters) {
  for (let i = 0; i < fighters.length; i++) {
    const f = fighters[i];
    f.buffs ||= {};
    for (const key of Object.keys(f.buffs)) {
      f.buffs[key]--;
      if (f.buffs[key] <= 0) delete f.buffs[key];
    }
  }
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
  orb.respawn--;
  if (orb.respawn <= 0) orb.active = true;
}

function collect(state, f, orb) {
  applyBuff(f, orb);
  orb.active = false;
  orb.respawn = 720;
  state.events.push({ type: 'pickup', x: orb.x, y: orb.y, color: orb.color, letter: orb.letter, damage: 0 });
}

function applyBuff(f, orb) {
  f.buffs ||= {};
  if (orb.id === 'chesedHeal') f.damage = Math.max(0, f.damage - 35);
  else f.buffs[orb.id] = Math.max(f.buffs[orb.id] || 0, orb.duration);
}
