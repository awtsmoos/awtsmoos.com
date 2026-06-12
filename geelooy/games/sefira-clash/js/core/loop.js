import { driveBots } from '../ai/botBrain.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { updateGrabs } from '../combat/grabResolver.js';
import { maybeStartAttack } from '../combat/startAttack.js';
import { updateShield } from '../combat/shields.js';
import { resolveWinner } from './winner.js';
import { applyMovement } from '../physics/movement.js';
import { integrate } from '../physics/integrate.js';
import { updateLedgeGrab } from '../physics/ledgeGrab.js';
import { resolvePlatforms } from '../physics/platforms.js';
import { resolveWalls } from '../physics/walls.js';
import { attachBlastEvents, resolveBlast } from '../physics/blastZones.js';
import { resolveStomps } from '../physics/special/stomp.js';
import { resolveLandingShockwaves } from '../physics/special/landingShockwave.js';
import { solveSkeleton } from '../skeleton/solveSkeleton.js';
import { resolveWeaponPickups, syncHeldWeapons } from '../weapons/weaponPickup.js';
import { stepPowerups } from '../powerups/powerupSystem.js';
import { stepNarrative } from '../narrative/narrativeSystem.js';
import { addEventParticles, stepParticles } from '../particles/particles.js';
import { addWeaponTrails } from '../particles/emitters/weaponTrails.js';
import { addAmbientDust } from '../particles/emitters/ambientDust.js';
import { playEvents } from '../feedback/feedback.js';

/**
 * B"H
 * One full battle tick: planner, combat, movement, ledges, walls, platforms.
 *
 * Chapter 210: the new systems are threaded into time. Grabs update, ledges
 * catch, walls bounce, platforms land, and every event becomes sound/light.
 */
export function stepState(state, input) {
  state.frame++;
  attachBlastEvents(state.map, state.events);
  if (stepHitstop(state)) return;
  driveBots(state);
  for (const f of state.fighters) stepFighter(state, f, f.human ? input : f.input);
  updateGrabs(state.fighters);
  resolveLandingShockwaves(state);
  resolveStomps(state);
  resolveAttacks(state);
  resolveWeaponPickups(state);
  stepPowerups(state);
  syncHeldWeapons(state);
  stepAftermath(state);
  resolveWinner(state);
}

function stepHitstop(state) {
  if (!state.hitstop) return false;
  stepAftermath(state);
  resolveWinner(state);
  state.hitstop--;
  return true;
}

function stepAftermath(state) {
  playEvents(state.events);
  stepNarrative(state);
  addWeaponTrails(state);
  addAmbientDust(state);
  addEventParticles(state);
  stepParticles(state);
}

function stepFighter(state, f, input) {
  if (f.dead) return;
  f.wasGrounded = !!f.grounded;
  f.lastInput = input;
  f.stun = Math.max(0, f.stun - 1);
  updateShield(f, input);
  maybeStartAttack(f, input, state);
  applyMovement(f, input);
  integrate(f);
  resolveWalls(f, state);
  updateLedgeGrab(f, state.map, input);
  f.preLandingVy = f.vy;
  resolvePlatforms(f, state.map);
  solveSkeleton(f);
  resolveBlast(f, state.map);
}
