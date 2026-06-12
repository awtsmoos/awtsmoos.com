/**
 * B"H
 * Edge-triggered jump state interpreter.
 *
 * Chapter 221: holding upward is not infinite pleading. One upward motion gives
 * one jump. The thumb must return from the sky and rise again before the second
 * jump is allowed, exactly like the soul drawing a new breath.
 */
export function updateJumpState(f, input) {
  f.jumpMemory ||= { wasJumping: false, hold: 0 };
  const freshPress = !!input.jump && !f.jumpMemory.wasJumping;
  f.jumpMemory.hold = input.jump ? f.jumpMemory.hold + 1 : 0;
  f.jumpBuffer = freshPress ? 7 : Math.max(0, (f.jumpBuffer || 0) - 1);
  f.coyote = f.grounded ? 8 : Math.max(0, (f.coyote || 0) - 1);
}

export function wantsJumpPress(f, input) {
  return !!input.jump && !f.jumpMemory?.wasJumping;
}

export function consumeJump(f, input) {
  if (f.grounded || f.coyote > 0) return groundJump(f, input);
  return airJump(f);
}

export function rememberJump(f, input) {
  f.jumpMemory ||= { wasJumping: false, hold: 0 };
  f.jumpMemory.wasJumping = !!input.jump;
}

function groundJump(f, input) {
  const shortHop = input.down;
  f.vy = -f.stats.jump * (shortHop ? 0.72 : 1.08);
  f.grounded = false;
  f.jumpsUsed = 1;
  f.jumpBuffer = 0;
  f.coyote = 0;
  return true;
}

function airJump(f) {
  const maxJumps = 2 + (f.buffs?.doubleJump ? 1 : 0) + (f.hatStats?.extraJump ? 1 : 0);
  if ((f.jumpsUsed || 1) >= maxJumps) return false;
  f.jumpsUsed = (f.jumpsUsed || 1) + 1;
  f.vy = -f.stats.jump * 1.16;
  f.jumpBuffer = 0;
  f.fastFalling = false;
  return true;
}
