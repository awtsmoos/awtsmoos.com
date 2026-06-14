/**
 * B"H
 * Capsule attack pose overrides.
 *
 * Chapter 129: a punch must reveal intention before impact and recovery after
 * impact. The Awtsmoos turns buttons into staged body language.
 */
import { add, clamp } from './math.js';

export function applyAttackPose(p, f) {
  const attack = f.attack || f.rapidAttack;
  if (!attack) return p;
  const frame = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = clamp(frame / Math.max(1, (attack.startup || 4) + (attack.active || 5)), 0, 1);
  const face = p.face;
  if (attack.id?.includes('kick') || attack.id === 'roundhouse' || attack.id === 'meteorKick') return kickPose(p, face, t, attack);
  return punchPose(p, face, t, attack);
}

function punchPose(p, face, t, attack) {
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.rapid ? 36 : attack.fullCharge ? 62 : 48;
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.55, -4 + t * 4);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, -3 + t * 2);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 14, 31);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 22, 58);
  p.chest = add(p.chest, face * (attack.fullCharge ? 8 : 4), -2);
  p.head = add(p.head, face * 4, -1);
  return p;
}

function kickPose(p, face, t, attack) {
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.fullCharge ? 68 : 54;
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * 0.45, -13);
  p[side + 'Foot'] = add(p[side + 'Hip'], face * reach, -8 + t * 2);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 7, 42);
  p[other + 'Foot'] = add(p[other + 'Hip'], -face * 16, 73);
  p.leftHand = add(p.leftHand, -face * 8, -8);
  p.rightHand = add(p.rightHand, -face * 8, -8);
  p.chest = add(p.chest, -face * 3, -4);
  return p;
}
