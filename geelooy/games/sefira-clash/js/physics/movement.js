import { clamp } from '../core/vectors.js';
import { applyAirControl, applyAirDodge } from './airControl.js';
import { applyRecoveryMove } from './recoveryMove.js';
import { consumeJump, rememberJump, updateJumpState, wantsJumpPress } from './jumpState.js';

/**
 * B"H
 * Movement without platform phasing.
 *
 * Chapter 5: the old stone swallowed anyone who pressed down. That was not a
 * ledge release; it was exile through the floor. Now down only hushes ledge
 * re-grab near a real platform lip. The body must leave by an edge, never by
 * ghosting through the full face of the platform.
 *
 * @param {object} f Fighter being moved.
 * @param {object} input Normalized player or NPC command.
 * @returns {void}
 */
export function applyMovement(f, input) {
  f.motionClock = (f.motionClock || 0) + 1;
  f.dropCooldown = Math.max(0, (f.dropCooldown || 0) - 1);
  prepareLedgeOnlyRelease(f, input);
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

/**
 * Allows a down-held ledge departure without allowing platform passthrough.
 * @param {object} f Fighter state.
 * @param {object} input Command object.
 * @returns {void}
 */
function prepareLedgeOnlyRelease(f, input) {
  if (!f.grounded || !wantsDown(input)) return;
  const edgeIntent = Math.abs(input.x || 0) > 0.28;
  if (!edgeIntent && !isAlreadyAtPlatformLip(f)) return;
  f.noLedgeTimer = Math.max(f.noLedgeTimer || 0, 26);
  f.dropCooldown = Math.max(f.dropCooldown || 0, 6);
}

function isAlreadyAtPlatformLip(f) {
  const width = f.currentPlatform?.w || f.platformWidth || 0;
  const left = f.currentPlatform?.x;
  if (left == null || !width) return false;
  return f.x < left + 48 || f.x > left + width - 48;
}

function wantsDown(input) {
  return !!input.down || input.y > 0.45 || input.aimY > 0.45;
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
