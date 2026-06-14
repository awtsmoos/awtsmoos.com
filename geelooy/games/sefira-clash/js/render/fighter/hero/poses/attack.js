/**
 * B"H
 * Hero attack poses.
 *
 * Chapter 177: punch and kick become icons. Each attack cuts a clean silhouette
 * with one decisive limb and one balancing limb.
 */
import { add, smooth } from '../math.js';
import { HERO } from '../style.js';

export function applyHeroAttack(p, f) {
  const a = f.attack || f.rapidAttack;
  if (!a) return p;
  const frame = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const t = smooth(Math.min(1, frame * HERO.timing.attack / span));
  return isKick(a) ? kick(p, a, Math.max(0.52, t)) : punch(p, a, Math.max(a.rapid ? 0.6 : 0.45, t));
}

function isKick(a) { return a.id?.includes('kick') || a.id === 'roundhouse' || a.id === 'meteorKick'; }

function punch(p, a, t) {
  const face = p.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = a.fullCharge ? 86 : a.rapid ? 58 : 72;
  p.chest = add(p.chest, face * 5 * t, -2);
  p.head = add(p.head, face * 3 * t, -1);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.45, 5);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 6);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 22, 43);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 32, 80);
  return p;
}

function kick(p, a, t) {
  const face = p.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = a.fullCharge ? 92 : 78;
  p.chest = add(p.chest, -face * 5, -5);
  p.leftHand = add(p.leftHand, -face * 10, -12);
  p.rightHand = add(p.rightHand, -face * 10, -12);
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * 0.48, -66);
  p[side + 'Foot'] = add(p[side + 'Hip'], face * reach * t, -88);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 12, 54);
  p[other + 'Foot'] = add(p[other + 'Hip'], -face * 24, 94);
  return p;
}
