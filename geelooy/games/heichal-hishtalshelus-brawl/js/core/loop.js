import { driveBots } from '../ai/botBrain.js';
import { applyMovement } from '../physics/movement.js';
import { integrate } from '../physics/integrate.js';
import { resolvePlatforms } from '../physics/platforms.js';
import { resolveBlast } from '../physics/blastZones.js';
import { solveSkeleton } from '../skeleton/solveSkeleton.js';
import { maybeStartAttack } from '../combat/startAttack.js';
import { updateShield } from '../combat/shields.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { resolveWeaponPickups, syncHeldWeapons } from '../weapons/weaponPickup.js';
import { stepPowerups } from '../powerups/powerupSystem.js';
import { stepNarrative } from '../narrative/narrativeSystem.js';
import { addEventParticles, stepParticles } from '../particles/particles.js';
import { addWeaponTrails } from '../particles/emitters/weaponTrails.js';
import { addAmbientDust } from '../particles/emitters/ambientDust.js';

/**
 * B"H
 * One tick of the fight.
 *
 * Chapter 50: time itself now flinches. During hitstop, bodies freeze at the
 * instant of consequence while sparks and story still move. The player reads
 * impact without losing the living smoke around it.
 */
export function stepState(state, input) {
  state.frame++;
  if (stepHitstop(state)) return;
  driveBots(state);
  for (const f of state.fighters) stepFighter(state, f, f.human ? input : f.input);
  resolveAttacks(state);
  resolveWeaponPickups(state);
  stepPowerups(state);
  syncHeldWeapons(state);
  stepAftermath(state);
  const alive = state.fighters.filter(f => !f.dead);
  state.winner = alive.length === 1 ? alive[0].name : '';
}

function stepHitstop(state) {
  if (!state.hitstop) return false;
  state.hitstop--;
  stepAftermath(state);
  return true;
}

function stepAftermath(state) {
  stepNarrative(state);
  addWeaponTrails(state);
  addAmbientDust(state);
  addEventParticles(state);
  stepParticles(state);
}

function stepFighter(state, f, input) {
  if (f.dead) return;
  f.stun = Math.max(0, f.stun - 1);
  updateShield(f, input);
  maybeStartAttack(f, input);
  applyMovement(f, input);
  integrate(f);
  resolvePlatforms(f, state.map);
  solveSkeleton(f);
  resolveBlast(f, state.map);
}
