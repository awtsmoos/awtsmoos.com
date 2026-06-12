/**
 * B"H
 * Charge attack helpers with AI hold-vow support.
 *
 * Chapter 16: tap is lightning, hold is thunder, and the NPC may now choose
 * thunder deliberately. A first AI charge frame does not become an accidental
 * instant kick; it becomes the beginning of a timed vow that later releases.
 */
export const CHARGE_THRESHOLD = 13;

export function chargeFramesFor(f, button) {
  return button === 'kick' ? f.charge?.kick || 0 : f.charge?.punch || 0;
}

export function chargeRatio(frames) {
  return Math.max(0, Math.min(1, frames / 85));
}

export function shouldInstantButton(f, button, intent) {
  if (isAiCharge(button, intent)) return false;
  if (button === 'punch') return intent.pressed.punch && chargeFramesFor(f, button) <= 1;
  if (button === 'kick') return intent.pressed.kick && chargeFramesFor(f, button) <= 1;
  return false;
}

export function shouldReleaseButton(f, button, intent) {
  const frames = chargeFramesFor(f, button);
  if (frames < CHARGE_THRESHOLD) return false;
  if (button === 'punch') return intent.releasedPunch && f.charge?.armedPunch;
  if (button === 'kick') return intent.releasedKick && f.charge?.armedKick;
  return false;
}

export function chargeOptions(intent, frames) {
  return { charge: chargeRatio(frames), aim: intent.aim, rapid: false };
}

function isAiCharge(button, intent) {
  return button === 'kick' ? intent.aiChargeKick : intent.aiChargePunch;
}
