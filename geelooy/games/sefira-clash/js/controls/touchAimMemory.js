/**
 * B"H
 * Touch aim memory.
 *
 * Chapter 50: when the thumb releases the stick, the angle does not vanish. It
 * remains a little ember so Android buttons still strike with intention.
 */
export function updateTouchAim(state, x, y, mag) {
  if (mag < 0.18) return;
  state.lastAimX = x;
  state.lastAimY = y;
  state.lastAimFrames = 90;
}

export function tickTouchAim(state) {
  state.lastAimFrames = Math.max(0, (state.lastAimFrames || 0) - 1);
  if (state.lastAimFrames) return { aimX: state.lastAimX || 0, aimY: state.lastAimY || 0 };
  return { aimX: 0, aimY: 0 };
}
