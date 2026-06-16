/** B"H — charge compresses the body until release becomes inevitable. */
import { add } from '../CharacterRig.js';
import { clamp, wave } from './Math.js';
export function charge(p, f) {
  const face = p.face, c = clamp(f.chargeGlow || f.charge?.punch / 70 || f.charge?.kick / 70 || 0);
  const tremble = wave(f, 0.7) * c * 3;
  p.pelvis = add(p.pelvis, -face * 10 * c, 7 * c);
  p.chest = add(p.chest, -face * (18 * c + tremble), 5 * c);
  p.head = add(p.head, -face * (10 * c + tremble), 2 * c);
  p.leftHand = add(p.leftHand, -face * (26 + 12 * c), -30 * c);
  p.rightHand = add(p.rightHand, face * (26 + 12 * c), -30 * c);
  p.leftKnee = add(p.leftKnee, -face * 7 * c, -8 * c);
  p.rightKnee = add(p.rightKnee, face * 7 * c, -8 * c);
  return p;
}
