/** B"H — shield: circle, recoil, shatter; the guarded soul still moves. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';

export function shieldLayer(p, f, info) {
  if (!info.name.startsWith('shield')) return p;
  const face = p.face;
  const hit = info.name === 'shieldHit' ? 1 : 0;
  const broken = info.name === 'shieldBreak' ? 1 : 0;
  const tremble = wave(f, 0.74) * (hit * 5 + broken * 8);
  p.pelvis = add(p.pelvis, -face * (3 + hit * 7 + broken * 12), hit * 2 + broken * 9);
  p.chest = add(p.chest, -face * (3 + hit * 12 + broken * 22 + tremble), -2 + hit * 5 + broken * 16);
  p.head = add(p.head, -face * (hit * 10 + broken * 26 + tremble), hit * 3 + broken * 18);
  p.leftHand = add(p.leftHand, -face * (18 + hit * 18 - broken * 4), -36 + hit * 10 + broken * 42);
  p.rightHand = add(p.rightHand, face * (18 - hit * 6 + broken * 18), -38 + hit * 12 + broken * 50);
  p.leftElbow = add(p.leftElbow, -face * (hit * 8 + broken * 18), hit * 3 + broken * 22);
  p.rightElbow = add(p.rightElbow, face * (hit * 6 + broken * 22), hit * 4 + broken * 24);
  p.leftKnee = add(p.leftKnee, -face * (hit * 5 + broken * 10), -hit * 4 + broken * 8);
  p.rightKnee = add(p.rightKnee, face * (hit * 5 + broken * 10), -hit * 4 + broken * 8);
  return p;
}
