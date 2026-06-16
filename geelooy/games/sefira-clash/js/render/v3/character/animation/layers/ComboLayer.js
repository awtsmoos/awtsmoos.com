/** B"H — combo aura nudges the skeleton like hidden fire under armor. */
import { add } from '../../CharacterRig.js';
import { clamp, wave } from '../Math.js';

export function comboLayer(p, f, info) {
  const c = clamp(info.combo);
  if (!c) return p;
  const pulse = wave(f, 0.42) * c * 2;
  p.head = add(p.head, p.face * pulse, -c * 3);
  p.chest = add(p.chest, p.face * pulse, -c * 2);
  return p;
}
