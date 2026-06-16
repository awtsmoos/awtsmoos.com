/** B"H — death is readable but brief; the spark is already returning. */
import { add } from '../CharacterRig.js';
export function knockout(p, f) {
  const face = p.face;
  p.chest = add(p.chest, -face * 18, 24);
  p.head = add(p.head, -face * 30, 28);
  p.leftHand = add(p.leftHand, -face * 45, 18);
  p.rightHand = add(p.rightHand, face * 10, 30);
  p.leftFoot = add(p.leftFoot, -face * 25, 10);
  p.rightFoot = add(p.rightFoot, face * 18, 12);
  return p;
}
