/**
 * B"H
 * Hero depth converter.
 *
 * Chapter 192: arms do not merely draw; they pass before and behind the suit.
 * The Awtsmoos assigns each part its stage layer.
 */
export function backArmSide(face) {
  return face > 0 ? 'left' : 'right';
}

export function frontArmSide(face) {
  return face > 0 ? 'right' : 'left';
}
