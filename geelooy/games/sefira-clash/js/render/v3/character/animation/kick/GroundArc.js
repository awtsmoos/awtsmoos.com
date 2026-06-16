/** B"H — grounded kick arc, a readable sweep engraved in air. */
import { add } from '../../CharacterRig.js';

export function groundArc(p, face, lead, plant, wind, hit, rec, round) {
  p[lead + 'Knee'] = add(p[lead + 'Hip'], -face * wind * 24 + face * hit * (round ? 48 : 36), 34 - hit * 38 + rec * 28);
  p[lead + 'Foot'] = add(p[lead + 'Hip'], -face * wind * 38 + face * hit * (round ? 92 : 72), 62 - hit * 58 + rec * 38);
  p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * hit * 10, -hit * 8);
  p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * hit * 14, 0);
}
