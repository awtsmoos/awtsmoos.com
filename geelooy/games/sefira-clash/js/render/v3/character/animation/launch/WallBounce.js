/** B"H — wall bounce: the wall says no, and the spine hears it. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';

export function wallBounce(p, f, x) {
  const shiver = wave(f, 0.9) * 4;
  p.pelvis = add(p.pelvis, -x * 12, 8);
  p.chest = add(p.chest, -x * (26 + shiver), 5);
  p.head = add(p.head, -x * (34 + shiver), -4);
  p.leftHand = add(p.leftHand, x * 18, -24);
  p.rightHand = add(p.rightHand, x * 22, -10);
  p.leftFoot = add(p.leftFoot, -x * 36, 14);
  p.rightFoot = add(p.rightFoot, -x * 42, 24);
  return p;
}
