/** B"H — ordinary launch stretch, the straight line after impact. */
import { add } from '../../CharacterRig.js';

export function baseLaunch(p, x, y) {
  p.chest = add(p.chest, x * 20, y * 13);
  p.head = add(p.head, x * 28, y * 10 - 8);
  p.leftHand = add(p.leftHand, x * 38, -22);
  p.rightHand = add(p.rightHand, x * 42, -26);
  p.leftFoot = add(p.leftFoot, -x * 18, 18);
  p.rightFoot = add(p.rightFoot, -x * 22, 20);
  return p;
}
