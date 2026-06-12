import { clamp } from '../core/vectors.js';
import { stepRapidJail } from '../ai/advanced/combat/hitEscapeIntent.js';
import { moveBuff } from '../fighters/applyHatStats.js';
import { applyAirControl, applyAirDodge } from './airControl.js';
import { applyRecoveryMove } from './recoveryMove.js';
import { consumeJump, rememberJump, updateJumpState, wantsJumpPress } from './jumpState.js';

/** B"H — Chapter 34: hunt-fire speeds distant AI feet; down-air becomes a real dive. */
export function applyMovement(f, input) {
  f.motionClock = (f.motionClock || 0) + 1;
  f.dropCooldown = Math.max(0, (f.dropCooldown || 0) - 1);
  f.rapidMobilityFrames = Math.max(0, (f.rapidMobilityFrames || 0) - 1);
  f.diveCooldown = Math.max(0, (f.diveCooldown || 0) - 1);
  stepRapidJail(f);
  prepareLedgeOnlyRelease(f, input);
  updateJumpState(f, input);
  if (f.ledgeHang || f.grabbedBy) return rememberJump(f, input);
  if (normalHitlock(f)) return decayNormalLag(f, input);
  moveGroundOrBase(f, input);
  if (wantsJumpPress(f, input) || f.jumpBuffer > 0) consumeJump(f, input);
  applyDiveIntent(f, input);
  applyAirControl(f, input);
  applyRecoveryMove(f, input);
  applyAirDodge(f, input);
  rememberJump(f, input);
}

function normalHitlock(f) { return (f.stun > 0 || f.landingLag > 0 || f.diveStunned > 0) && !rapidFreedom(f); }
function rapidFreedom(f) { return f.rapidMobilityFrames > 0 || f.rapidJail?.active; }

function applyDiveIntent(f, input) {
  if (f.grounded || f.diveCooldown || !wantsDown(input)) return;
  if ((f.vy || 0) < -6) return;
  f.diving = 18;
  f.diveCooldown = 24;
  f.fastFalling = true;
  f.vy = Math.max(f.vy || 0, 12.5);
  f.vx += clamp((input.x || input.aimX || 0) * 1.9, -1.9, 1.9);
}

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

function wantsDown(input) { return !!input.down || input.y > 0.45 || input.aimY > 0.45; }

function moveGroundOrBase(f, input) {
  const x = input.x || 0;
  const speed = moveBuff(f) * (input.hunt ? 1.42 : 1);
  const accel = (f.grounded ? f.stats.accel : f.stats.air * 0.45) * speed;
  const max = (f.stats.maxSpeed || 10) * speed;
  f.vx = clamp(f.vx + x * accel, -max, max);
  if (Math.abs(x) > 0.05) f.face = x < 0 ? -1 : 1;
}

function decayNormalLag(f, input) {
  f.landingLag = Math.max(0, (f.landingLag || 0) - 1);
  f.diveStunned = Math.max(0, (f.diveStunned || 0) - 1);
  rememberJump(f, input);
}
