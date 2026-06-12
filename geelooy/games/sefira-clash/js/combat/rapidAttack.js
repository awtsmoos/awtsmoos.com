/**
 * B"H
 * Rapid attack resolver data.
 *
 * Chapter 177: fast clicking becomes flurry, not broken charge. Rapid punches
 * and kicks are intentionally weak but sticky, creating pressure, stun, and
 * Hebrew sparks without replacing smash attacks.
 */
export function rapidMove(button, intent) {
  if (button === 'kick') return intent.airborne ? 'aerialKick' : 'sweep';
  return intent.aim.up ? 'uppercut' : 'jab1';
}

export function isRapid(button, intent) {
  return button === 'punch' ? intent.rapid.punch : intent.rapid.kick;
}

export function rapidOptions(button, intent) {
  const up = intent.aim.up;
  const down = intent.aim.down;
  return {
    rapid: true,
    angle: up ? -0.85 : down ? 0.55 : -0.08,
    aim: intent.aim,
    grabKind: '',
    throwKind: ''
  };
}
