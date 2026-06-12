import { clamp } from '../core/vectors.js';
import { applyAirControl, applyAirDodge } from './airControl.js';
import { applyRecoveryMove } from './recoveryMove.js';
import { consumeJump, rememberJump, updateJumpState, wantsJumpPress } from './jumpState.js';

/**
 * B"H
 * Responsive movement with real jump, drift, fast-fall, and recovery layers.
 *
 * Chapter 188: movement becomes a stack of small laws. Ground acceleration,
 * jump intent, air drift, recovery burst, and air dodge each speak once, so
 * the player can fight like a platform fighter instead of a drifting balloon.
 */
export function applyMovement(f, input) {
  f.motionClock = (f.motionClock || 0) + 1;
  f.dropTimer = 0;
  updateJumpState(f, input);
  if (f.ledgeHang || f.grabbedBy) return rememberJump(f, input);
  if (f.stun > 0 || f.landingLag > 0) return decayLag(f, input);
  moveGroundOrBase(f, input);
  if (wantsJumpPress(f, input) || f.jumpBuffer > 0) consumeJump(f, input);
  applyAirControl(f, input);
  applyRecoveryMove(f, input);
  applyAirDodge(f, input);
  rememberJump(f, input);
}

function moveGroundOrBase(f, input) {
  const x = input.x || 0;
  const boots = f.buffs?.netzachBoots ? 1.24 : 1;
  const accel = (f.grounded ? f.stats.accel : f.stats.air * 0.45) * boots;
  const max = (f.stats.maxSpeed || 10) * boots;
  f.vx = clamp(f.vx + x * accel, -max, max);
  if (Math.abs(x) > 0.05) f.face = x < 0 ? -1 : 1;
}

function decayLag(f, input) {
  f.landingLag = Math.max(0, (f.landingLag || 0) - 1);
  rememberJump(f, input);
}
