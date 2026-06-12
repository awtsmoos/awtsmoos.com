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
import { resolveLipRescue } from '../physics/lipRescue.js';
import { attachBlastEvents, resolveBlast } from '../physics/blastZones.js';
import { stepRespawns } from '../physics/respawn.js';
import { resolveStomps } from '../physics/special/stomp.js';
import { resolveLandingShockwaves } from '../physics/special/landingShockwave.js';
import { solveSkeleton } from '../skeleton/solveSkeleton.js';
import { resolveWeaponPickups, syncHeldWeapons } from '../weapons/weaponPickup.js';
import { stepPowerups } from '../powerups/powerupSystem.js';
import { stepStageDirector } from '../stage/events/stageDirector.js';
import { stepNarrative } from '../narrative/narrativeSystem.js';
import { addEventParticles, stepParticles } from '../particles/particles.js';
import { addWeaponTrails } from '../particles/emitters/weaponTrails.js';
import { addAmbientDust } from '../particles/emitters/ambientDust.js';
import { playEvents } from '../feedback/feedback.js';
import { stepSpectacleFromEvents } from '../spectacle/spectacleEvents.js';
import { stepSpectacleState } from '../spectacle/spectacleState.js';

/**
 * B"H
 * Full battle tick with spectacle before particle consumption.
 *
 * Chapter 10: the brawl remains a brawl. Damage does not bend. Physics does not
 * beg. Yet before events vanish into sparks, the Awtsmoos lets the eye hear the
 * blow: flash, quake, ring, streak. The created world is renewed from nothing,
 * and the combat loop becomes the instant where that renewal roars.
 */
export function stepState(state, input) {
  state.frame++;
  attachBlastEvents(state.map, state.events);
  stepRespawns(state);
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
  stepStageDirector(state);
  stepSpectacleFromEvents(state);
  stepAftermath(state);
  stepSpectacleState(state);
  resolveWinner(state);
}

function stepHitstop(state) {
  if (!state.hitstop) return false;
  stepStageDirector(state);
  stepSpectacleFromEvents(state);
  stepAftermath(state);
  stepSpectacleState(state);
  resolveWinner(state);
  state.hitstop--;
  return true;
}

function stepAftermath(state) {
  if (state.fastSim) return clearInvisibleEvents(state);
  playEvents(state.events, state);
  stepNarrative(state);
  addWeaponTrails(state);
  addAmbientDust(state);
  addEventParticles(state);
  stepParticles(state);
}

function clearInvisibleEvents(state) {
  state.events.length = 0;
  if (state.particles?.length) state.particles.length = 0;
}

function stepFighter(state, f, input) {
  if (f.dead || f.hidden || f.respawnTimer) return;
  f.wasGrounded = !!f.grounded;
  f.lastInput = input;
  f.stun = Math.max(0, f.stun - 1);
  f.respawnGrace = Math.max(0, (f.respawnGrace || 0) - 1);
  updateShield(f, input);
  maybeStartAttack(f, input, state);
  applyMovement(f, input);
  integrate(f);
  resolveWalls(f, state);
  updateLedgeGrab(f, state.map, input);
  f.preLandingVy = f.vy;
  resolvePlatforms(f, state.map);
  resolveLipRescue(f, state.map);
  solveSkeleton(f);
  resolveBlast(f, state.map);
}
