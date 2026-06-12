/**
 * B"H
 * Rapid attack resolver data.
 *
 * Chapter 25: rapid fire is not glue. It is a drum of real strikes: each spark
 * damages, launches, and moves the victim like a normal hit, only with less
 * recovery prison so agency survives the storm.
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
    noGlue: true,
    angle: up ? -0.85 : down ? 0.55 : -0.08,
    aim: intent.aim,
    grabKind: '',
    throwKind: ''
  };
}
