import { ATTACKS } from '../data/attacks.js';
import { consumeCharge } from './attackState.js';
import { chooseDirectionalMove, directionAngle, normalizedAttackAim } from './directionalAttack.js';
import { chargeOptions, chargeFramesFor, shouldInstantButton, shouldReleaseButton } from './chargeAttack.js';
import { rapidMove, rapidOptions } from './rapidAttack.js';

/**
 * B"H
 * Move picker with clean rapid and charge separation.
 *
 * Chapter 109: rapid is never charged thunder. Charge is only chosen on release
 * after a held vow; rapid is a separate spark and consumes no stored power.
 */
export function pickMove(f, intent) {
  const aim = normalizedAttackAim(f, intent);
  if (intent.wantsGrab) return picked('grab', { aim, grabKind: 'grab' });
  if (intent.wantsSpecial) return picked('special', { aim, charge: 0, angle: directionAngle(ATTACKS.special.angle, { ...intent, aim }, 'special') });
  const rapid = pickRapid(intent, aim);
  if (rapid) return rapid;
  const instantPunch = pickInstant(f, intent, 'punch', aim);
  if (instantPunch) return instantPunch;
  const instantKick = pickInstant(f, intent, 'kick', aim);
  if (instantKick) return instantKick;
  const punch = pickRelease(f, intent, 'punch', aim);
  if (punch) return punch;
  const kick = pickRelease(f, intent, 'kick', aim);
  if (kick) return kick;
  return null;
}

export function wantsRapidOverride(f, intent) {
  if (f.stun > 0 || f.blocking || f.grabbedBy) return false;
  if (!f.attack) return false;
  if (intent.rapidPunch && canOverride(f, 'punch')) return true;
  if (intent.rapidKick && canOverride(f, 'kick')) return true;
  return false;
}

function pickRapid(intent, aim) {
  if (intent.rapidPunch || intent.forceRapid) return picked(rapidMove('punch', intent), { ...rapidOptions('punch', intent), aim, charge: 0 });
  if (intent.rapidKick) return picked(rapidMove('kick', intent), { ...rapidOptions('kick', intent), aim, charge: 0 });
  return null;
}

function canOverride(f, button) {
  f.rapidOverride ||= { punch: -99, kick: -99 };
  const frame = f.motionClock || 0;
  const gap = button === 'punch' ? 5 : 9;
  if (frame - f.rapidOverride[button] < gap) return false;
  f.rapidOverride[button] = frame;
  return true;
}

function pickInstant(f, intent, button, aim) {
  if (!shouldInstantButton(f, button, intent)) return null;
  const aimedIntent = { ...intent, aim };
  const id = chooseDirectionalMove(button, f, aimedIntent, 0);
  const base = ATTACKS[id];
  consumeCharge(f, button);
  return picked(id, { charge: 0, aim, rapid: false, angle: directionAngle(base.angle, aimedIntent, id) });
}

function pickRelease(f, intent, button, aim) {
  if (!shouldReleaseButton(f, button, intent)) return null;
  const frames = chargeFramesFor(f, button);
  consumeCharge(f, button);
  const aimedIntent = { ...intent, aim };
  const id = chooseDirectionalMove(button, f, aimedIntent, frames);
  const base = ATTACKS[id];
  const opts = chargeOptions(aimedIntent, frames);
  return picked(id, { ...opts, aim, angle: directionAngle(base.angle, aimedIntent, id) });
}

function picked(id, options) {
  return { id, options, base: ATTACKS[id] };
}
