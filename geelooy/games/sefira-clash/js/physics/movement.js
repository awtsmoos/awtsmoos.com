import { clamp } from '../core/vectors.js';

/**
 * B"H
 * Responsive movement with double-jump, short-hop, fast-fall, and air-dodge.
 *
 * Chapter 59: the body now has fighting-game grammar. A tap becomes a short
 * hop, down becomes fast fall, shield in air becomes a desperate dodge, and
 * jump buffering/coyote time forgive the human without making movement mushy.
 */
export function applyMovement(f, input) {
  f.jumpMemory ||= { wasJumping: false, held: 0 };
  f.motionClock = (f.motionClock || 0) + 1;
  f.dodgeCooldown = Math.max(0, (f.dodgeCooldown || 0) - 1);
  f.airDodge = Math.max(0, (f.airDodge || 0) - 1);
  f.jumpBuffer = input.jump ? 6 : Math.max(0, (f.jumpBuffer || 0) - 1);
  if (f.grounded) f.coyote = 7;
  else f.coyote = Math.max(0, (f.coyote || 0) - 1);
  if (f.stun > 0 || f.landingLag > 0) return decayLag(f, input);
  moveSideways(f, input);
  if (pressedJump(f, input) || f.jumpBuffer > 0) tryJump(f, input);
  applyAirOptions(f, input);
  rememberJump(f, input);
}

function moveSideways(f, input) {
  const x = input.x || 0;
  const boots = f.buffs?.netzachBoots ? 1.22 : 1;
  const accel = (f.grounded ? f.stats.accel : f.stats.air) * boots;
  const max = (f.stats.maxSpeed || 9) * boots;
  f.vx = clamp(f.vx + x * accel, -max, max);
  if (Math.abs(x) > 0.05) f.face = x < 0 ? -1 : 1;
}

function applyAirOptions(f, input) {
  f.fastFalling = !f.grounded && (input.y > 0.45 || input.down);
  if (f.fastFalling && f.vy > -1) f.vy += 0.78;
  if (input.special && !f.grounded && f.stats.recovery) f.vy -= 0.38 * f.stats.recovery;
  if (!f.grounded && input.shield && f.dodgeCooldown === 0) airDodge(f, input);
}

function tryJump(f, input) {
  if (f.grounded || f.coyote > 0) groundJump(f, input);
  else airJump(f);
}

function groundJump(f, input) {
  const shortHop = input.y > 0.45 || input.down;
  f.vy = -f.stats.jump * (shortHop ? 0.72 : 1);
  f.grounded = false;
  f.jumpsUsed = 1;
  f.jumpBuffer = 0;
  f.coyote = 0;
}

function airJump(f) {
  const maxJumps = 2 + (f.buffs?.doubleJump ? 1 : 0);
  if ((f.jumpsUsed || 1) >= maxJumps) return;
  f.jumpsUsed = (f.jumpsUsed || 1) + 1;
  f.vy = -f.stats.jump * 0.82;
  f.jumpBuffer = 0;
}

function airDodge(f, input) {
  const x = input.x || f.face || 1;
  f.vx = x * 11;
  f.vy = (input.y || 0) * 7 - 2;
  f.airDodge = 16;
  f.dodgeCooldown = 80;
}

function decayLag(f, input) {
  f.landingLag = Math.max(0, (f.landingLag || 0) - 1);
  rememberJump(f, input);
}

function pressedJump(f, input) { return !!input.jump && !f.jumpMemory.wasJumping; }
function rememberJump(f, input) { f.jumpMemory.wasJumping = !!input.jump; }
