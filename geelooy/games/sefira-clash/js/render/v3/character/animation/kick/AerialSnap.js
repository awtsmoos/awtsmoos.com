/** B"H — aerial snap kick: the whole body becomes a diagonal blade. */
import { add } from '../../CharacterRig.js';

export function snapAerial(p, face, lead, plant, wind, hit, rec, round) {
  p[lead + 'Knee'] = add(p[lead + 'Hip'], -face * wind * 30 + face * hit * (round ? 70 : 58), 20 - hit * 52 + rec * 22);
  p[lead + 'Foot'] = add(p[lead + 'Hip'], -face * wind * 46 + face * hit * (round ? 118 : 100), 42 - hit * 78 + rec * 30);
  p[plant + 'Knee'] = add(p[plant + 'Knee'], -face * (22 + hit * 18), -22 + hit * 12);
  p[plant + 'Foot'] = add(p[plant + 'Foot'], -face * (26 + hit * 16), -18 + hit * 8);
}
