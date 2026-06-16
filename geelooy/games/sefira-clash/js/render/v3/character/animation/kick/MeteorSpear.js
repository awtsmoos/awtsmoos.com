/** B"H — meteor spear: descent written as judgment in the lower boot. */
import { add } from '../../CharacterRig.js';

export function spearDown(p, face, lead, plant, wind, hit, rec) {
  p.chest = add(p.chest, face * hit * 4, 10 + hit * 18);
  p.head = add(p.head, face * hit * 4, 10 + hit * 16);
  p[lead + 'Knee'] = add(p[lead + 'Hip'], -face * wind * 18 + face * hit * 24, 40 + hit * 34 + rec * 18);
  p[lead + 'Foot'] = add(p[lead + 'Hip'], -face * wind * 26 + face * hit * 38, 86 + hit * 56 + rec * 22);
  p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * (24 + hit * 12), -18 + hit * 18);
  p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * (30 + hit * 8), -12 + hit * 16);
}
