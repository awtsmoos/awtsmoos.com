/**
 * B"H
 * Charge attack helpers.
 *
 * Chapter 178: hold is a vow, release is judgment. The helper decides whether
 * a released button was charged enough to become smash, while still allowing
 * quick taps to become normal attacks.
 */
export function chargeFramesFor(f, button) {
  return button === 'kick' ? f.charge?.kick || 0 : f.charge?.punch || 0;
}

export function chargeRatio(frames) {
  return Math.max(0, Math.min(1, frames / 85));
}

export function shouldReleaseButton(f, button, intent) {
  if (button === 'punch') return intent.releasedPunch && f.charge?.armedPunch;
  if (button === 'kick') return intent.releasedKick && f.charge?.armedKick;
  return false;
}

export function chargeOptions(intent, frames) {
  return { charge: chargeRatio(frames), aim: intent.aim, rapid: false };
}
