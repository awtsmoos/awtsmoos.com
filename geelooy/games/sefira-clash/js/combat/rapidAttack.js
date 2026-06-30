/**
 * B"H
 * Rapid attack resolver data.
 *
 * Rapid punch is a jab drum. Rapid kick is a boot rhythm, slower but wider. It
 * should feel like sparks, never glue, never accidental charge thunder.
 */
export function rapidMove(button, intent) {
  if (button === 'kick') return intent.airborne ? 'aerialKick' : intent.aim.down ? 'sweep' : 'roundhouse';
  return intent.aim.up ? 'uppercut' : 'jab1';
}

export function isRapid(button, intent) {
  return button === 'punch' ? intent.rapid.punch : intent.rapid.kick;
}

export function rapidOptions(button, intent) {
  const up = intent.aim.up;
  const down = intent.aim.down;
  const kick = button === 'kick';
  return {
    rapid: true,
    noGlue: true,
    angle: up ? -0.9 : down ? 0.62 : kick ? -0.22 : -0.06,
    aim: intent.aim,
    grabKind: '',
    throwKind: ''
  };
}
