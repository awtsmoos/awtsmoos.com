import { ATTACKS } from '../data/attacks.js';
import { consumeCharge } from './attackState.js';
import { chooseDirectionalMove, directionAngle, normalizedAttackAim } from './directionalAttack.js';
import { chargeOptions, chargeFramesFor, shouldReleaseButton } from './chargeAttack.js';
import { isRapid, rapidMove, rapidOptions } from './rapidAttack.js';

/**
 * B"H
 * Move picker with authoritative attack aim.
 *
 * Chapter 232: the chosen move carries its direction with it. A strike aimed
 * right remains right, a strike aimed up remains up, and a strike with no
 * joystick remembers the fighter's face as its kavannah.
 */
export function pickMove(f, intent) {
  const aim = normalizedAttackAim(f, intent);
  if (intent.wantsGrab) return picked('grab', { aim, grabKind: 'grab' });
  if (intent.wantsSpecial) return picked('special', { aim, charge: chargeFramesFor(f, 'punch') / 85, angle: directionAngle(ATTACKS.special.angle, { ...intent, aim }, 'special') });
  const rapid = pickRapid(f, intent, aim);
  if (rapid) return rapid;
  const punch = pickRelease(f, intent, 'punch', aim);
  if (punch) return punch;
  const kick = pickRelease(f, intent, 'kick', aim);
  if (kick) return kick;
  return null;
}

function pickRapid(f, intent, aim) {
  if (isRapid('punch', intent) && intent.pressed.punch) return picked(rapidMove('punch', intent), { ...rapidOptions('punch', intent), aim });
  if (isRapid('kick', intent) && intent.pressed.kick) return picked(rapidMove('kick', intent), { ...rapidOptions('kick', intent), aim });
  return null;
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
