/**
 * B"H
 * Very slow mockup attack poses.
 *
 * Chapter 156: punch and kick no longer flash past the eye. They keep the same
 * gameplay timing, but the visible pose eases slowly so mobile motion feels calm.
 */
import { add, clamp } from './math.js';
import { LIMB_BOUNDS } from './limbBounds.js';

export function applyAttackPose(p, f) {
  const attack = f.attack || f.rapidAttack;
  if (!attack) return p;
  const rawFrame = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const visualFrame = rawFrame * LIMB_BOUNDS.timing.attack;
  const span = Math.max(1, (attack.startup || 5) + (attack.active || 7) + (attack.recovery || 8));
  const t = clamp(visualFrame / span, 0, 1);
  if (attack.id?.includes('kick') || attack.id === 'roundhouse' || attack.id === 'meteorKick') return kickPose(p, t, attack);
  return punchPose(p, t, attack);
}

function punchPose(p, t, attack) {
  const face = p.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.rapid ? 45 : attack.fullCharge ? 68 : 54;
  const staged = smooth(t < 0.42 ? t / 0.42 : 1);
  const floor = attack.rapid ? 0.58 : attack.fullCharge ? 0.52 : 0;
  const punchT = Math.max(floor, staged);
  const wind = attack.rapid || attack.fullCharge ? 0 : t < 0.42 ? -1 : 1;
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * (reach * 0.43 * punchT + wind * 9), 9);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * (reach * punchT + wind * 14), 8);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 16, 43);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 25, 78);
  p.chest = add(p.chest, face * (attack.fullCharge ? 5 : 3) * punchT, -1.5);
  p.head = add(p.head, face * 2.5 * punchT, -1);
  return p;
}

function kickPose(p, t, attack) {
  const face = p.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.fullCharge ? 72 : 58;
  const kickT = smooth(t < 0.52 ? t / 0.52 : 1);
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * 0.42, -10);
  p[side + 'Foot'] = add(p[side + 'Hip'], face * reach * kickT, -9);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 9, 54);
  p[other + 'Foot'] = add(p[other + 'Hip'], -face * 20, 92);
  p.leftHand = add(p.leftHand, -face * 8, -7);
  p.rightHand = add(p.rightHand, -face * 8, -7);
  p.chest = add(p.chest, -face * 2.5, -4);
  return p;
}

function smooth(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}
